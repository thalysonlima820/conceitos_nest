import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { RecadosService } from './recados.service';
import { CreateRecadoDto } from './dto/create-recado.dto';
import { UpdateRecadoDto } from './dto/update-recado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parse-int-id.pipe';
import { ParseValidateUserPipe } from 'src/common/pipes/parse-validade-user.pipe';
import { SimpleCacheInterceptor } from 'src/common/interceptors/simple-cache.interceptor';
import { UrlParam } from 'src/common/params/url-param.decoretor';
import { reqDataParam } from 'src/common/params/req-data-param.decoretor';
import { RecadoUltils } from './recado.utils';
import { removeSpacesRegex } from 'src/common/regex/remove-spaces.regex';
import {
  ONLY_LOWERCASE_LETTERS_REGEX,
  REMOVE_SPACE_REGEX,
} from 'src/common/constants/serve-name.constant';
import { onlyLowercaseLettersRegex } from 'src/common/regex/only-lowercase-letters.regex';
import { MY_DYNAMICE_CONFIG } from 'src/my-dynamic/my-dynamic.module';
import type { MyDynamicModuleConfigs } from 'src/my-dynamic/my-dynamic.module';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { SetRoutePolicy } from 'src/auth/decorators/set_route_policy.decorator';
import { RoutePolicy } from 'src/auth/enum/route-policy.enum';

@Controller('recados')
//@UseInterceptors(timingConnectionInterceptor)
export class RecadosController {
  constructor(
    private readonly recadosService: RecadosService,
    private readonly recadosUltils: RecadoUltils,
    @Inject(REMOVE_SPACE_REGEX)
    private readonly removeSpacesRegex: removeSpacesRegex,
    @Inject(ONLY_LOWERCASE_LETTERS_REGEX)
    private readonly onlyLowercaseLettersRegex: onlyLowercaseLettersRegex,
    @Inject(MY_DYNAMICE_CONFIG)
    private readonly myDynamicModule: MyDynamicModuleConfigs,
  ) {
    //console.log(this.myDynamicModule.apikey)
    //console.log(this.myDynamicModule.apiUrl)
  }

  @Get()
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.findAllRecados)
  @UseInterceptors(SimpleCacheInterceptor)
  findAll(
    @Query() paginationDto: PaginationDto,
    @Req() req: Request,
    @UrlParam() url: string,
    @reqDataParam('method') method,
  ) {
    console.log(req.url);
    console.log(url);
    console.log(method);
    console.log(req['user']);
    //console.log(req['teste'].chave);
    console.log(this.recadosUltils.inventerString('thalyson'));
    console.log(this.removeSpacesRegex.execute('REMOVE OS ESPACOS'));
    console.log(this.onlyLowercaseLettersRegex.execute('REMOVE OsssS ESPACOS'));

    //throw new BadRequestException('erro gerado por mim');
    return this.recadosService.findAll(paginationDto);
  }

  @Get(':id')
  @UsePipes(ParseIntIdPipe)
  findOne(@Param('id') id: number) {
    console.log(typeof id);
    return this.recadosService.findOne(id);
  }

  @Post()
  @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  @SetRoutePolicy(RoutePolicy.createRecado)
  create(
    @Body('paraId', ParseValidateUserPipe) paraId: number,
    @Body() dto: CreateRecadoDto,
    @TokenPayloadParam() tokenPaylod: TokenPayloadDto,
  ) {
    console.log('aqui ', tokenPaylod);
    return this.recadosService.create(dto, tokenPaylod);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() UpdateRecadoDto: UpdateRecadoDto,
    @TokenPayloadParam() tokenPaylod: TokenPayloadDto,
  ) {
    return this.recadosService.update(id, UpdateRecadoDto, tokenPaylod);
  }

  @Delete(':id')
  @SetRoutePolicy(RoutePolicy.deleteRecado)
   @UseGuards(AuthTokenGuard, RoutePolicyGuard)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TokenPayloadParam() tokenPaylod: TokenPayloadDto,
  ) {
    console.log(id, typeof id);
    return this.recadosService.remove(id, tokenPaylod);
  }
}
