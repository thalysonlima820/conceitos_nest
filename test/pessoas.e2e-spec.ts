import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import appConfig from 'src/app/app.config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecadosModule } from 'src/recados/recados.module';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import appConfigTest from 'src/app/config/app.configTest';
import { createPessoaDto } from './factories/pessoas.factory';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forFeature(appConfig),
        TypeOrmModule.forRoot({
          type: 'postgres',
          host: 'localhost',
          port: 5432,
          username: 'postgres',
          database: 'testing',
          password: '7586',
          autoLoadEntities: true,
          synchronize: true,
          dropSchema: true,
        }),
        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname, '../', '../', 'pictures'),
          serveRoot: '/pictures',
        }),
        RecadosModule,
        PessoasModule,
        AuthModule,
      ],
    }).compile();

    app = module.createNestApplication();

    // app.useGlobalPipes(
    //   new ValidationPipe({
    //     whitelist: true, //remover chaves que nao estao no DTO
    //     forbidNonWhitelisted: true, // levantar erro de chave nao existente
    //     transform: false, // tenta tranformar os tipo de dados de parametro e DTO
    //   }),
    //   new ParseIntIdPipe(),
    // );

    appConfigTest(app);

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/pessoas (POST)', () => {
    it('deve criar uma pessoa com Sucesso', async () => {
      const PessoaDto = createPessoaDto();
      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(PessoaDto)
        .expect(HttpStatus.CREATED);

      expect(response.body).toEqual({
        email: PessoaDto.email,
        passwordHash: expect.any(String),
        nome: PessoaDto.nome,
        RoutePolicies: PessoaDto.RoutePolicies,
        active: true,
        createAt: expect.any(String),
        id: expect.any(Number),
        picture: '',
        updateAt: expect.any(String),
      });
    });

    it('deve gerar um erro de e-mail já existe', async () => {
      const PessoaDto = createPessoaDto();

      await request(app.getHttpServer())
        .post('/pessoas')
        .send(PessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(PessoaDto)
        .expect(HttpStatus.CONFLICT);

      expect(response.body.message).toBe('Email já cadastrado');
    });

    it('deve gerar um erro de senha curta', async () => {
      const PessoaDto = createPessoaDto({
        password: '123',
      });

      const response = await request(app.getHttpServer())
        .post('/pessoas')
        .send(PessoaDto)
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body.message).toEqual([
        'password must be longer than or equal to 5 characters',
      ]); // verifica se a mensagem e essa
      expect(response.body.message).toContain(
        'password must be longer than or equal to 5 characters',
      ); //ele verifica se existe essa mensagem caso tenha mais de 1
    });
  });

  describe('/pessoas/:id (GET)', () => {
    it('deve retonar UNAUTHORIZED quando o usuaieo nao estiver logado', async () => {
      const PessoaDto = createPessoaDto();
      const pessoaResponse = await request(app.getHttpServer())
        .post('/pessoas')
        .send(PessoaDto)
        .expect(HttpStatus.CREATED);

      const response = await request(app.getHttpServer())
        .get('/pessoas/' + pessoaResponse.body.id)
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body).toEqual({
        message: 'nao logado',
        error: 'Unauthorized',
        statusCode: 401,
      });
    });
    it('deve retonar a pessoa quando o usuaieo estiver logado', async () => {
      const PessoaDto = createPessoaDto();
      const pessoaResponse = await request(app.getHttpServer())
        .post('/pessoas')
        .send(PessoaDto)
        .expect(HttpStatus.CREATED);

      const loginResponse = await request(app.getHttpServer())
        .post('/auth')
        .send({ email: PessoaDto.email, password: PessoaDto.password });

      const response = await request(app.getHttpServer())
        .get('/pessoas/' + pessoaResponse.body.id)
        .set('Authorization', `Bearer ${loginResponse.body.token}`)
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        email: PessoaDto.email,
        passwordHash: expect.any(String),
        nome: PessoaDto.nome,
        RoutePolicies: PessoaDto.RoutePolicies,
        active: true,
        createAt: expect.any(String),
        id: expect.any(Number),
        picture: '',
        updateAt: expect.any(String),
      });
    });
  });
});
