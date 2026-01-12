import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MaxLength, MinLength } from 'class-validator';

export class CreatePessoaDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
  //@IsStrongPassword()
  @IsNotEmpty()
  @MinLength(5)
  readonly password: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(50)
  readonly nome: string;
}
