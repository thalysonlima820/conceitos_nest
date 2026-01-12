import { Injectable } from '@nestjs/common';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { Pessoa } from './entities/pessoa.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class PessoasService {
  constructor(
    @InjectRepository(Pessoa)
    private readonly pessoaRepository: Repository<Pessoa>
  ){}

  async create(createPessoaDto: CreatePessoaDto) {
    const pessoaData = {
      email: createPessoaDto.email,
      passwordHast: createPessoaDto.password,
      nome: createPessoaDto.nome,
    }

    const novaPessoa = this.pessoaRepository.create(pessoaData);
    await this.pessoaRepository.save(novaPessoa)
    return novaPessoa;
  }

  async findAll() {
    return `This action returns all pessoas`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} pessoa`;
  }

  async update(id: number, updatePessoaDto: UpdatePessoaDto) {
    return `This action updates a #${id} pessoa`;
  }

  async remove(id: number) {
    return `This action removes a #${id} pessoa`;
  }
}
