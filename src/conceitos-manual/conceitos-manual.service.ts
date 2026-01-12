import { Injectable } from '@nestjs/common';

@Injectable()
export class ConceitosManualService {
  getHome(): string {
    return 'servico e contolar manual ok!';
  }
}
