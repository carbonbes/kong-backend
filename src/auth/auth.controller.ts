import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Headers,
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
import { AccessJwtAuthGuard } from '@/shared/guards/passport/access-jwt.guard'
import { RefreshJwtAuthGuard } from '@/shared/guards/passport/refresh-jwt.guard'
import { EncodedJwt, Jwts } from '@/shared/types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body)
  }

  @Post('signin')
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body)
  }

  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  update(
    @Headers('Authorization') refresh_token: EncodedJwt,
    @Body() body: AccessTokenDto,
  ) {
    const jwts: Jwts = {
      access_token: body.access_token,
      refresh_token,
    }

    return this.authService.rotate(jwts)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  logout(
    @Headers('Authorization') access_token: EncodedJwt,
    @Body() body: RefreshTokenDto,
  ) {
    const jwts: Jwts = {
      access_token,
      refresh_token: body.refresh_token,
    }

    return this.authService.logout(jwts)
  }
}
