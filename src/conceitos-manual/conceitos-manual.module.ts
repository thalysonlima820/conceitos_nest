import { Module } from '@nestjs/common';
import { ConceitoManualController } from './conceitos-manual.controller';
import { ConceitosManualService } from './conceitos-manual.service';
import { AppService } from 'src/app/app.service';

@Module({
  controllers: [ConceitoManualController],
  providers: [ConceitosManualService, AppService],
})
export class ConceitosManualModule {}
