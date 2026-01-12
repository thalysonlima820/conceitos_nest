import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //remover chaves que nao estao no DTO
      forbidNonWhitelisted: true, // levantar erro de chave nao existente
      transform: false, // tenta tranformar os tipo de dados de parametro e DTO
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
