import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { PessoasService } from './pessoas.service';
import { CreatePessoaDto } from './dto/create-pessoa.dto';
import { UpdatePessoaDto } from './dto/update-pessoa.dto';
import { RecadoUltils } from 'src/recados/recado.utils';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthTokenGuard } from 'src/auth/guards/auth-token.guard';
import { TokenPayloadParam } from 'src/auth/params/token-payload.param';
import { TokenPayloadDto } from 'src/auth/dto/token-payload.dto';
import { REQUEST_TOKEN_PAYLOAD_KEY } from 'src/auth/auth.constants';
import { RoutePolicyGuard } from 'src/auth/guards/route-policy.guard';
import { FileInterceptor } from '@nestjs/platform-express';


@Public()
@Controller('pessoas')
@UseGuards(RoutePolicyGuard)
export class PessoasController {
  constructor(
    private readonly pessoasService: PessoasService,
    private readonly recadosUltils: RecadoUltils,
  ) {}

  @Post()
  create(@Body() createPessoaDto: CreatePessoaDto) {
    return this.pessoasService.create(createPessoaDto);
  }

  @Get()
  @UseGuards(AuthTokenGuard)
  findAll(@Req() req: Request) {
    console.log(req[REQUEST_TOKEN_PAYLOAD_KEY]);
    console.log(this.recadosUltils.inventerString('thalyson'));
    return this.pessoasService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthTokenGuard)
  findOne(@Param('id') id: string) {
    return this.pessoasService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(AuthTokenGuard)
  update(
    @Param('id') id: string,
    @Body() updatePessoaDto: UpdatePessoaDto,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.pessoasService.update(+id, updatePessoaDto, tokenPayload);
  }

  @Delete(':id')
  @UseGuards(AuthTokenGuard)
  remove(
    @Param('id') id: string,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.pessoasService.remove(+id, tokenPayload);
  }

  @Post('upload-picture')
  @UseGuards(AuthTokenGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadPicture(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({maxSize: 10 * (1024*1024)}),
          new FileTypeValidator({fileType: 'image/jpeg'})
        ],
      })
    ) file: Express.Multer.File,
    @TokenPayloadParam() tokenPayload: TokenPayloadDto,
  ) {
    return this.pessoasService.uploadPicture(file, tokenPayload)
  }

}
