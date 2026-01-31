import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { Repository } from 'typeorm';
import { Pessoa } from 'src/pessoas/entities/pessoa.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from './hashing/hashing.service';
import jwtConfig from './config/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async login(LoginDto: LoginDto) {
    let passwordIsValid = false;
    let throwError = true;

    const pessoa = await this.pessoaRepository.findOneBy({
      email: LoginDto.email,
      active: true,
    });

    if(!pessoa) throw new UnauthorizedException('pessoa nao autorizada')

    if (pessoa) {
      passwordIsValid = await this.hashingService.compare(
        LoginDto.password,
        pessoa.passwordHash,
      );
    }

    if (passwordIsValid) {
      throwError = false;
    }

    if (throwError) {
      throw new UnauthorizedException('Usuario ou senha invalidos');
    }

    return this.createTokens(pessoa);
  }

  private async createTokens(pessoa: Pessoa) {
    const acessTokenPromise = this.singJwtAsync<Partial<Pessoa>>(
      Number(pessoa?.id),
      this.jwtConfiguration.jwtTtl,
      { email: pessoa?.email },
    );

    const refreshTokenPromise = this.singJwtAsync(
      Number(pessoa?.id),
      this.jwtConfiguration.jwtRefresgttl,
    );

    const [acessToken, refreshToken] = await Promise.all([
      acessTokenPromise,
      refreshTokenPromise,
    ]);

    return {
      token: acessToken,
      refreshToken,
    };
  }

  private async singJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn: expiresIn,
      },
    );
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync(
        refreshTokenDto.refreshToken,
        this.jwtConfiguration,
      );
      const pessoa = await this.pessoaRepository.findOneBy({
        id: sub,
        active: true,
      });
      if (!pessoa) throw new Error('pessoa nao autorizada ');

      return this.createTokens(pessoa);
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }
}
