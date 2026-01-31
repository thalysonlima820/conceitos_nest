import { IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateRecadoDto {
  @IsString({ message: 'O campo Texto Esta vazio ou formatado Errado' })
  @IsNotEmpty()
  readonly texto: string;

  @IsPositive()
  readonly paraId: number;
}
