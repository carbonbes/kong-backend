import { Body, Controller, Get, Post, Req } from '@nestjs/common'
import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { AuthService } from './auth.service'
import { Public } from '../shared/decorators/public.decorator'
import { Request } from 'express'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  async signUp(@Body() data: SignUpDto) {
    return await this.authService.signUp(data)
  }

  @Post('signin')
  @Public()
  async signIn(@Body() data: SignInDto) {
    return await this.authService.signIn(data)
  }

  @Post('verify-otp')
  @Public()
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return await this.authService.verifyOtp(data)
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }
}
