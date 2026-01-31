import { Controller, Get, HttpCode, HttpStatus, Inject, Param } from '@nestjs/common';
import { AppService } from './app.service';
import appConfig from './app.config';
import type { ConfigType } from '@nestjs/config';


@Controller('home')
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject(appConfig.KEY)
    private readonly appConfigurations: ConfigType<typeof appConfig>,
  ) {}
  @HttpCode(HttpStatus.OK)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/teste')
  getTeste() {
    return this.appService.getTeste();
  }

  @Get('/teste/:codprod')
  getFiltro(@Param('codprod') codprod: string) {
    const cod = Number(codprod);
    const lista = this.appService.getTeste();

    return lista.filter(i => i.codprod === cod);
  }

  // teste(@Query() pagination: any) {
  //   const { limit = 10, offset = 0, user } = pagination;
  //   console.log(limit, offset, user);
  // }
}
