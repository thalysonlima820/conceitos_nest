import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';

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

  @IsEnum(RoutePolicy, {each: true})
  RoutePolicies: RoutePolicy[]
}
