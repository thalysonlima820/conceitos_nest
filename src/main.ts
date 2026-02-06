import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //remover chaves que nao estao no DTO
      forbidNonWhitelisted: true, // levantar erro de chave nao existente
      transform: false, // tenta tranformar os tipo de dados de parametro e DTO
    }),
  );

  // helmet -> cabecalho de seguranca no portocolo http
  // cora -> permitir dominio a requsitar sua api

  if (process.env.NODE_ENV === 'production') {
    app.use(helmet());
    app.enableCors({
      origin: '*',
    });
  }

  await app.listen(process.env.APP_PORT as any);
}
void bootstrap();
