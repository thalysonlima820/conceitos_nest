import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';

export default (app: INestApplication) => {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, //remover chaves que nao estao no DTO
      forbidNonWhitelisted: true, // levantar erro de chave nao existente
      transform: false, // tenta tranformar os tipo de dados de parametro e DTO
    }),
    new ParseIntIdPipe(),
  );
  return app;
};
