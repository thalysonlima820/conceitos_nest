import { CreatePessoaDto } from 'src/pessoas/dto/create-pessoa.dto';

export function createPessoaDto(
  overrides?: Partial<CreatePessoaDto>,
): CreatePessoaDto {
  return {
    email: 'pessoa@gmail.com',
    nome: 'Pessoa',
    password: '123456',
    RoutePolicies: [],
    ...overrides,
  };
}
