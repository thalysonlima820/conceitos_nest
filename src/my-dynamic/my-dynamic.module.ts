import { DynamicModule, Module } from '@nestjs/common';
import { REMOVE_SPACE_REGEX } from 'src/common/constants/serve-name.constant';
import { RegexFactory } from 'src/common/regex/regexFactory';

export type MyDynamicModuleConfigs = {
  apikey: string;
  apiUrl: string;
};

export const MY_DYNAMICE_CONFIG = 'MY_DYNAMICE_CONFIG';

@Module({})
export class MyDynamicModule {
  static register(myModuleConfigs: MyDynamicModuleConfigs): DynamicModule {
    console.log('metodo MyDynamicModule iniciado.');
    return {
      module: MyDynamicModule,
      imports: [],
      providers: [
        
        {
          provide: MY_DYNAMICE_CONFIG,
          useFactory: async () => {
            console.log('logica de programacao aqui');
            await new Promise(res => setTimeout(res, 3000));
            return myModuleConfigs;
          },
          //useValue: myModuleConfigs
        },
        RegexFactory,
        {
          provide: REMOVE_SPACE_REGEX,
          useFactory: (regexFactory: RegexFactory) => {
            return regexFactory.create('removeSpacesRegex');
          },
          inject: [RegexFactory],
        },
      ],
      controllers: [],
      exports: [MY_DYNAMICE_CONFIG, REMOVE_SPACE_REGEX],
      // global: true
    };
  }
}
