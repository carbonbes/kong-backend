import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { AccessJwtAuthGuard } from '../shared/guards/access-jwt.guard'
import { RefreshJwtAuthGuard } from '../shared/guards/refresh-jwt.guard'
import { Cookies } from '../shared/decorators/cookies.decorator'
import { EncodedJwt } from '../jwts/jwts.types'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signUp(@Body() data: SignUpDto) {
    return this.authService.signUp(data)
  }

  @Post('signin')
  signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data)
  }

  @Post('verify-otp')
  verifyOtp(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOtp(data)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  update(
    @Cookies(['access_token', 'refresh_token']) credentials: EncodedJwt[],
  ) {
    return this.authService.update(credentials)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  logout(
    @Cookies(['access_token', 'refresh_token']) credentials: EncodedJwt[],
  ) {
    return this.authService.logout(credentials)
  }
}
