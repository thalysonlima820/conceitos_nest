import { Body, Controller, Post } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authServicess: AuthService) {}

  @Post()
  login(@Body() LoginDto: LoginDto) {
    return this.authServicess.login(LoginDto);
  }

  @Post('refresh')
    refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authServicess.refreshTokens(refreshTokenDto);
  }
}

