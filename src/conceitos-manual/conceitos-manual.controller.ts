import { Controller, Get } from '@nestjs/common';
import { ConceitosManualService } from './conceitos-manual.service';
import { AppService } from 'src/app/app.service';

@Controller('conceitos-manual')
export class ConceitoManualController {
  constructor(
    private readonly conceitosManualService: ConceitosManualService,
    private readonly appService: AppService,
  ) {}

  @Get()
  home(): string {
    return this.conceitosManualService.getHome();
  }
  @Get('teste')
  teste() {
    return this.appService.getTeste();
  }
}
