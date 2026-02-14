import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common'
import {
  AccessTokenDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
} from './auth.dtos'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { EncodedJwt } from '@/shared/types'
import { Jwts } from '@/jwt/jwt.types'
import { Public } from '@/shared/decorators/public.decorator'
import { RefreshJwtAuthGuard } from '@/shared/guards/passport/refresh-jwt.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('signup')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body)
  }

  @Public()
  @Post('signin')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body)
  }

  @Public()
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body)
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  update(
    @Headers('Authorization') refresh_token: EncodedJwt,
    @Body() { access_token }: AccessTokenDto,
  ) {
    const jwts: Jwts = { access_token, refresh_token }

    return this.authService.rotate(jwts)
  }

  @Post('logout')
  logout(
    @Headers('Authorization') access_token: EncodedJwt,
    @Body() { refresh_token }: RefreshTokenDto,
  ) {
    const jwts: Jwts = { access_token, refresh_token }

    return this.authService.logout(jwts)
  }
}
