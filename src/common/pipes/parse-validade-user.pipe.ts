import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { PessoasService } from 'src/pessoas/pessoas.service';

@Injectable()
export class ParseValidateUserPipe implements PipeTransform {
  constructor(private readonly pessoaService: PessoasService) {}

  async transform(value: any) {
    const idUsuario = Number(value);
    if (isNaN(idUsuario)) {
      throw new BadRequestException('nao e numero');
    }

    const usuario = await this.pessoaService.findOne(idUsuario);

    if (!usuario) throw new BadRequestException('usuario nao existe');
    return idUsuario;
  }
}
