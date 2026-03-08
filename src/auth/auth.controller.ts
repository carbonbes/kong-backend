import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { SignInDto, SignUpDto, VerifyOtpDto } from './dtos'
import { AuthService } from './auth.service'
import { type Request } from 'express'
import { type EncodedJwt } from '@/shared/types'
import { Public } from '@/shared/decorators'
import { RefreshJwtAuthGuard } from '@/shared/guards'
import { AuthHeader } from '@/shared/decorators'
import { RefreshJwtDto } from '@/refresh-jwt/dtos'

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
  update(@AuthHeader() refreshToken: EncodedJwt) {
    return this.authService.update(refreshToken)
  }

  @Post('logout')
  logout(@Body() { refreshToken }: RefreshJwtDto) {
    return this.authService.logout(refreshToken)
  }
}
