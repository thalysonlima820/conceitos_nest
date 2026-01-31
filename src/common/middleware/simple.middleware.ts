import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

export class SimpleMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log('ola');
    const authorization = req.headers?.authorization;
    const now = Date.now();

    if (authorization) {
      req['user'] = {
        nome: 'luiz',
        sobrenome: 'otavio',
        role: 'admin',
      };
      req['teste'] = {
        chave: 'teste',
      };
    }

    res.setHeader('middleware', 'o valor do cabeca');

    next();


    res.on('finish', () => {
      const elaosed = (Date.now() - now) / 1000;
      console.log(`mide falou que levou ${elaosed}s`)
      console.log('conexao  terminal');
    });
  }
}
