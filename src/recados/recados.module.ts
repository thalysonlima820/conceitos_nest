import { forwardRef, Module } from '@nestjs/common';
import { RecadosController } from './recados.controller';
import { RecadosService } from './recados.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recado } from './entities/recado.entity';
import { PessoasModule } from 'src/pessoas/pessoas.module';
import { RecadoUltils, RecadoUltilsMock } from './recado.utils';
import { RegexFactory } from 'src/common/regex/regexFactory';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACE_REGEX,
} from 'src/common/constants/serve-name.constant';
import { MyDynamicModule } from 'src/my-dynamic/my-dynamic.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Recado]),
    PessoasModule,
    forwardRef(() => PessoasModule), // caso tenha loop de imprtacao
    MyDynamicModule.register({
      apikey: 'ddd',
      apiUrl: 'dd',
    }),
  ],
  controllers: [RecadosController],
  providers: [
    RecadosService,
    {
      provide: RecadoUltils,
      //useClass: RecadoUltils,
      useValue: new RecadoUltilsMock(),
    },
    RegexFactory,
    {
      provide: REMOVE_SPACE_REGEX,
      useFactory: (regexFactory: RegexFactory) => {
        return regexFactory.create('removeSpacesRegex');
      },
      inject: [RegexFactory],
    },
    {
      provide: ONLY_LOWERCASE_LETTERS_REGEX,
      useFactory: async (regexFactory: RegexFactory) => {
        console.log('aguardar resolver o awai');
        //await new Promise(resolve => setTimeout(resolve, 3000))
        console.log('finalizou');

        return regexFactory.create('onlyLowercaseLettersRegex');
      },
      inject: [RegexFactory],
    },
  ],
  exports: [RecadoUltils],
})
export class RecadosModule {}
