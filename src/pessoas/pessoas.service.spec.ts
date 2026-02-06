import { Repository } from 'typeorm';
import { PessoasService } from './pessoas.service';
import { Pessoa } from './entities/pessoa.entity';
import { HashingService } from 'src/auth/hashing/hashing.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import {
  BadGatewayException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';

jest.mock('fs/promises'); // Mocka o módulo fs

/* eslint-disable @typescript-eslint/unbound-method */
describe('pessoasService', () => {
  // beforeAll  -> roda UMA VEZ, antes de TODOS os testes
  // beforeEach -> roda ANTES de CADA teste
  // afterAll   -> roda UMA VEZ, depois de TODOS os testes
  // afterEach  -> roda DEPOIS de CADA teste

  let pessoaService: PessoasService;
  let pessoaRepository: Repository<Pessoa>;
  let hashingService: HashingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PessoasService,
        {
          provide: getRepositoryToken(Pessoa),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOneBy: jest.fn(),
            find: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashingService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    pessoaService = module.get<PessoasService>(PessoasService);
    pessoaRepository = module.get<Repository<Pessoa>>(
      getRepositoryToken(Pessoa),
    );
    hashingService = module.get<HashingService>(HashingService);
  });

  describe('create', () => {
    it('deve criar uma nova pessoa', async () => {
      const createPessoaDto: CreatePessoaDto = {
        email: 'luiz@gamil.com',
        nome: 'luiz',
        password: '123456',
        RoutePolicies: [],
      };

      const passwordHash = 'HASHDESENHA';
      const novaPessoa = {
        id: 1,
        email: createPessoaDto.email,
        nome: createPessoaDto.nome,
        RoutePolicies: createPessoaDto.RoutePolicies,
        passwordHash,
      };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(pessoaRepository, 'create').mockReturnValue(novaPessoa as any);

      // Act -> Ação
      const result = await pessoaService.create(createPessoaDto);

      // Assert
      // O método hashingService.hash foi chamado com createPessoaDto.password?
      expect(hashingService.hash).toHaveBeenCalledWith(
        createPessoaDto.password,
      );

      // pessoa com o hash de senha gerado por hashingService.hash?
      expect(pessoaRepository.create).toHaveBeenLastCalledWith({
        email: createPessoaDto.email,
        passwordHash: passwordHash,
        nome: createPessoaDto.nome,
        RoutePolicies: createPessoaDto.RoutePolicies,
      });
      // O método pessoaRepository.save foi chamado com os dados da nova
      // pessoa gerada por pessoaRepository.create?
      expect(pessoaRepository.save).toHaveBeenLastCalledWith(novaPessoa);

      // O resultado do método pessoaService.create retornou a nova
      // pessoa criada?
      expect(result).toEqual(novaPessoa);
    });

    it('deve lancar o conflitoexception quando o suairo ja for existente', async () => {
      const createPessoaDto = {};

      jest.spyOn(pessoaRepository, 'save').mockRejectedValue({
        code: '23505',
      });

      // const result = await pessoaService.create(createPessoaDto as any);

      await expect(
        pessoaService.create(createPessoaDto as any),
      ).rejects.toThrow(ConflictException);
    });

    it('deve lancar o qualquer erro', async () => {
      jest
        .spyOn(pessoaRepository, 'save')
        .mockRejectedValue(new Error('erro gerenerico'));

      // const result = await pessoaService.create(createPessoaDto as any);

      await expect(pessoaService.create({} as any)).rejects.toThrow(
        new Error('erro gerenerico'),
      );
    });
  });

  describe('findOne', () => {
    it('deve retornar uma pessoa se a pessoa for enconrada', async () => {
      const pessoaId = 1;
      const pessoaencontrada = {
        id: pessoaId,
        nome: 'luiz',
        email: 'talsd@dhe.com',
        password: 'q2343',
      };

      jest
        .spyOn(pessoaRepository, 'findOneBy')
        .mockResolvedValue(pessoaencontrada as any);

      const result = await pessoaService.findOne(pessoaId);

      expect(result).toEqual(pessoaencontrada);
    });
    it('deve retornar uma pessoa se a pessoa for enconrada', async () => {
      await expect(pessoaService.findOne(1)).rejects.toThrow(
        new NotFoundException('pessoa nao encotrada'),
      );
    });
  });

  describe('findAll', () => {
    it('dev a busca todos os usuarios', async () => {
      const pessoas: Pessoa[] = [];

      jest.spyOn(pessoaRepository, 'find').mockResolvedValue(pessoas);

      const result = await pessoaService.findAll();
      expect(result).toEqual(pessoas);
      expect(pessoaRepository.find).toHaveBeenCalledWith({
        order: {
          id: 'DESC',
        },
      });
    });
  });

  describe('update', () => {
    it('deve atualizar uma pessoa se  for autorizado', async () => {
      //arrage
      const pessoaid = 1;
      const updatePessoaDto = { nome: 'joao', password: '654321' };
      const tokenPayload = { sub: pessoaid } as any;
      const passwordHash = 'OK';
      const updatePessoa = { id: pessoaid, nome: 'joao', passwordHash };

      jest.spyOn(hashingService, 'hash').mockResolvedValue(passwordHash);
      jest
        .spyOn(pessoaRepository, 'preload')
        .mockResolvedValue(updatePessoa as any);
      jest
        .spyOn(pessoaRepository, 'save')
        .mockResolvedValue(updatePessoa as any);

      //act
      const result = await pessoaService.update(
        pessoaid,
        updatePessoaDto,
        tokenPayload,
      );

      //assert
      expect(result).toEqual(updatePessoa);
      expect(hashingService.hash).toHaveBeenCalledWith(
        updatePessoaDto.password,
      );
      expect(pessoaRepository.preload).toHaveBeenCalledWith({
        id: pessoaid,
        nome: updatePessoaDto.nome,
        passwordHash,
      });
      expect(pessoaRepository.save).toHaveBeenCalledWith(updatePessoa);
    });

    it('deve lancar um erro de usuario nao autorizada', async () => {
      const pessoaid = 1;
      const tokenPayload = { sub: 2 } as any;
      const updatePessoaDto = { nome: 'joao' };
      const existePessoa = { id: pessoaid, nome: 'joao' };

      jest
        .spyOn(pessoaRepository, 'preload')
        .mockResolvedValue(existePessoa as any);

      await expect(
        pessoaService.update(pessoaid, updatePessoaDto, tokenPayload),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lancar um erro de pessoa nao existente', async () => {
      const pessoaid = 1;
      const tokenPayload = { sub: pessoaid } as any;
      const updatePessoaDto = { nome: 'joao' };

      jest.spyOn(pessoaRepository, 'preload').mockResolvedValue(null as any);

      await expect(
        pessoaService.update(pessoaid, updatePessoaDto, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('deve remover uma pessoa se autorizado', async () => {
      const pessoaid = 1;
      const tokenPayload = { sub: pessoaid } as any;
      const existepessoa = { id: pessoaid, nome: 'joao' };

      jest
        .spyOn(pessoaService, 'findOne')
        .mockResolvedValue(existepessoa as any);
      jest
        .spyOn(pessoaRepository, 'remove')
        .mockResolvedValue(existepessoa as any);

      const result = await pessoaService.remove(pessoaid, tokenPayload);

      expect(pessoaService.findOne).toHaveBeenCalledWith(pessoaid);
      expect(pessoaRepository.remove).toHaveBeenCalledWith(existepessoa);
      expect(result).toEqual(existepessoa);
    });

    it('deve lancar um erro de usuario nao autorizada', async () => {
      const pessoaid = 1;
      const tokenPayload = { sub: 2 } as any;
      const existePessoa = { id: pessoaid, nome: 'joao' };

      jest
        .spyOn(pessoaService, 'findOne')
        .mockResolvedValue(existePessoa as any);

      await expect(
        pessoaService.remove(pessoaid, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar erro quando a pessoa não for encontrada', async () => {
      const pessoaid = 1;
      const tokenPayload = { sub: pessoaid } as any;

      jest.spyOn(pessoaService, 'findOne').mockResolvedValue(null as any);

      await expect(
        pessoaService.remove(pessoaid, tokenPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('uploadPicture', () => {
    it('deve salvar a imagem corretamente e atualizar a pessoa', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.jpg',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const mockPessoa = {
        id: 1,
        nome: 'Luiz',
        email: 'luiz@email.com',
      } as Pessoa;

      const tokenPayload = { sub: 1 } as any;

      jest.spyOn(pessoaService, 'findOne').mockResolvedValue(mockPessoa);
      jest.spyOn(pessoaRepository, 'save').mockResolvedValue({
        ...mockPessoa,
        picture: '1.jpg',
      });

      const filePath = path.resolve(process.cwd(), 'pictures', '1.jpg');

      // Act
      const result = await pessoaService.uploadPicture(mockFile, tokenPayload);

      // Assert
      expect(fs.writeFile).toHaveBeenCalledWith(filePath, mockFile.buffer);
      expect(pessoaRepository.save).toHaveBeenCalledWith({
        ...mockPessoa,
        picture: '1.jpg',
      });

      expect(result).toEqual({
        pessoa: { ...mockPessoa, picture: '1.jpg' },
      });
    });

    it('deve lançar BadRequestException se o arquivo for muito pequeno', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.jpg',
        size: 500, // Menor que 1024 bytes
        buffer: Buffer.from('small content'),
      } as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      // Act & Assert
      await expect(
        pessoaService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadGatewayException);
    });

    it('deve lançar NotFoundException se a pessoa não for encontrada', async () => {
      // Arrange
      const mockFile = {
        originalname: 'test.jpg',
        size: 2000,
        buffer: Buffer.from('file content'),
      } as Express.Multer.File;

      const tokenPayload = { sub: 1 } as any;

      jest
        .spyOn(pessoaService, 'findOne')
        .mockResolvedValue(null as any);

       // Act & Assert
      await expect(
        pessoaService.uploadPicture(mockFile, tokenPayload),
      ).rejects.toThrow(BadGatewayException);
    });
  });
});
