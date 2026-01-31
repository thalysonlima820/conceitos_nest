import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
  getTeste() {
    return [
      {
        codprod: 123,
        produto: 'pasta',
      },
      {
        codprod: 456,
        produto: 'coca',
      },
    ];
  }
}
