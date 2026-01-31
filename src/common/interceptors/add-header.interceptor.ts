import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { RecadosService } from 'src/recados/recados.service';

@Injectable()
export class AddHeaderInterceptor implements NestInterceptor {
  constructor(private readonly recadoService: RecadosService) {}
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const response = context.switchToHttp().getResponse();

    //const recado = await this.recadoService.findOne(42);
    //console.log(recado);

    response.setHeader('x-custom', 'o valor do cabeca');

    return next.handle();
  }
}
