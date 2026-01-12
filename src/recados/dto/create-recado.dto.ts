import { IsNotEmpty, IsString } from 'class-validator';

export class CreateRecadoDto {
  @IsString({ message: 'O campo Texto Esta vazio ou formatado Errado' })
  @IsNotEmpty()
  readonly texto: string;

  @IsString()
  @IsNotEmpty()
  readonly de: string;

  @IsString()
  @IsNotEmpty()
  readonly para: string;
}
