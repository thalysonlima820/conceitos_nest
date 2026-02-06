import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import * as path from 'path';
import * as fs from 'fs/promises';

@Injectable({ scope: Scope.DEFAULT })
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>,
    private readonly hashingService: HashingService,
  ) {}

  async create(createPessoaDto: CreatePessoaDto) {
    try {
      const passwordHash = await this.hashingService.hash(
        createPessoaDto.password,
      );
      console.log(passwordHash);
      const pessoaData = {
        email: createPessoaDto.email,
        passwordHash,
        nome: createPessoaDto.nome,
        RoutePolicies: createPessoaDto.RoutePolicies,
      };

      const novaPessoa = this.pessoaRepository.create(pessoaData);
      await this.pessoaRepository.save(novaPessoa);
      return novaPessoa;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Email já cadastrado');
      }

      throw error;
    }
  }

  async findAll() {
    const pessoas = await this.pessoaRepository.find({
      order: {
        id: 'DESC',
      },
    });
    return pessoas;
  }

  async findOne(id: number) {
    const pessoa = await this.pessoaRepository.findOneBy({ id });
    if(!pessoa) throw new NotFoundException('pessoa nao encotrada')
    return pessoa;
  }

  async update(
    id: number,
    updatePessoaDto: UpdatePessoaDto,
    tokenPayload: TokenPayloadDto,
  ) {
    const pessoaData = {
      nome: updatePessoaDto?.nome,
    };

    if (updatePessoaDto?.password) {
      const passwordHash = await this.hashingService.hash(
        updatePessoaDto.password,
      );
      pessoaData['passwordHash'] = passwordHash;
    }

    const pessoa = await this.pessoaRepository.preload({
      id,
      ...pessoaData,
    });
    if (!pessoa) {
      throw new NotFoundException('Pessoa nao encontrada');
    }

    if (pessoa.id !== tokenPayload.sub) {
      throw new ForbiddenException('voce nao e essa pessoa');
    }

    return this.pessoaRepository.save(pessoa);
  }

  async remove(id: number, tokenPayload: TokenPayloadDto) {
    const pessoa = await this.findOne(id);
    if (!pessoa) {
      throw new NotFoundException('Pessoa nao encontrada');
    }
    if (pessoa.id !== tokenPayload.sub) {
      throw new NotFoundException('voce nao e essa pessoa');
    }
    return this.pessoaRepository.remove(pessoa);
  }

  async uploadPicture(
    file: Express.Multer.File,
    tokenPayload: TokenPayloadDto,
  ) {
    if (file.size < 1024) {
      throw new BadGatewayException('file too small');
    }

    const pessoa = await this.findOne(tokenPayload.sub);

    if (!pessoa) throw new BadGatewayException('pessoa nao encontrda');

    const fileExtension = path
      .extname(file.originalname)
      .toLocaleLowerCase()
      .substring(1);
    const fileName = `${tokenPayload.sub}.${fileExtension}`;
    const fileFullPath = path.resolve(process.cwd(), 'pictures', fileName);

    await fs.writeFile(fileFullPath, file.buffer);

    pessoa.picture = fileName;
    await this.pessoaRepository.save(pessoa);

    return {
      pessoa,
    };
  }
}
