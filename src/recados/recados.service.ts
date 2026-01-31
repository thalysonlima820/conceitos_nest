import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PessoasService } from 'src/pessoas/pessoas.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';

//DEFAULT.    inicia so 1 vez
//REQUEST.    inicia em cada requisicao
//TRANSIENT.  e criado uma instancia do provider para cada class que injetar

@Injectable({ scope: Scope.DEFAULT })
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
    private readonly pessoaService: PessoasService,
    private readonly configServer: ConfigService,
  ) {
    const databaseUserName = this.configServer.get('DATABASE_USERNAME');
    console.log(databaseUserName);
  }

  throwNotFoundError() {
    throw new NotFoundException('Recado não encontrado');
    throw new HttpException('Sem Dados', HttpStatus.NOT_FOUND);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const recados = await this.recadoRepository.find({
      take: limit,
      skip: offset,
      relations: ['de', 'para'],
      order: {
        id: 'desc',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    return recados;
  }

  async findOne(id: number) {
    const recado = await this.recadoRepository.findOne({
      where: { id: id },
      relations: ['de', 'para'],
      order: {
        id: 'desc',
      },
      select: {
        de: {
          id: true,
          nome: true,
        },
        para: {
          id: true,
          nome: true,
        },
      },
    });
    if (recado) return recado;
    this.throwNotFoundError();
  }

  async create(CreateRecadoDto: CreateRecadoDto, tokenPaylod: TokenPayloadDto) {
    const { paraId } = CreateRecadoDto;

    const de = await this.pessoaService.findOne(tokenPaylod.sub);

    if (!de) {
      throw new NotFoundException('Pessoa de nao encontrada');
    }
    const para = await this.pessoaService.findOne(paraId);
    if (!para) {
      throw new NotFoundException('Pessoa para nao encontrada');
    }

    if (de.id === para.id) {
      throw new NotFoundException(
        'Nao pode enviar o recado para a mesma pessoa',
      );
    }

    const newRecado = {
      texto: CreateRecadoDto.texto,
      lido: false,
      data: new Date(),
      de,
      para,
    };
    const recado = await this.recadoRepository.create(newRecado);
    await this.recadoRepository.save(recado);
    return {
      ...recado,
      de: {
        id: recado.de.id,
        nome: recado.de.nome,
      },
      para: {
        id: recado.para.id,
         nome: recado.para.nome,
      },
    };
  }

  async update(id: number, dto: UpdateRecadoDto, tokenPaylod: TokenPayloadDto) {
    const recado = await this.findOne(id);

    if (!recado) throw new NotFoundException('Recado não encontrado');

    if(recado.de.id !== tokenPaylod.sub) throw new NotFoundException('nao pode editar recados que nao e seu');

    recado.texto = dto.texto ?? recado.texto;
    recado.lido = dto.lido ?? recado.lido;

    return this.recadoRepository.save(recado);
  }

  async remove(id: number, tokenPaylod: TokenPayloadDto) {
    const recado = await this.findOne(id);
    if (!recado) return this.throwNotFoundError();
     if(recado.de.id !== tokenPaylod.sub) throw new NotFoundException('nao pode deletar recados que nao e seu');
    return this.recadoRepository.remove(recado);
  }
}
