import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Recado } from './entities/recado.entity';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RecadosService {
  constructor(
    @InjectRepository(Recado)
    private readonly recadoRepository: Repository<Recado>,
  ) {}

  throwNotFoundError() {
    throw new NotFoundException('Recado não encontrado');
    throw new HttpException('Sem Dados', HttpStatus.NOT_FOUND);
  }

  async findAll() {
    const recados = await this.recadoRepository.find();
    return recados;
  }

  async findOne(id: number) {
    const recado = await this.recadoRepository.findOne({ where: { id: id } });
    if (recado) return recado;
    this.throwNotFoundError();
  }

  async create(CreateRecadoDto: CreateRecadoDto) {
    const newRecado = {
      ...CreateRecadoDto,
      data: new Date(),
    };
    const recado = await this.recadoRepository.create(newRecado);
    return this.recadoRepository.save(recado);
  }

  async update(id: number, UpdateRecadoDto: UpdateRecadoDto) {
    const partialUpdateDto = {
      lido: UpdateRecadoDto?.lido,
      texto: UpdateRecadoDto?.texto,
    };
    const recado = await this.recadoRepository.preload({
      id,
      ...partialUpdateDto,
    });
    if (!recado) return this.throwNotFoundError();
    return this.recadoRepository.save(recado);
  }

  async remove(id: number) {
    const recado = await this.recadoRepository.findOneBy({ id });
    if (!recado) return this.throwNotFoundError();
    return this.recadoRepository.remove(recado);
  }
}
