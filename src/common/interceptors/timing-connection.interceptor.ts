import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs';

@Injectable()
export class timingConnectionInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler<any>) {
    const now = Date.now();

    const response = context.switchToHttp().getRequest();
    const url = response.url;

    return next.handle().pipe(
      tap(() => {
        const elaosed = (Date.now() - now) / 1000;

        console.log(`a url ${url} levou ${elaosed}S`);
      }),
    );
  }
}
