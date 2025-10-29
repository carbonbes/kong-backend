import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { LogoutDto, RotateDto, SignInDto, SignUpDto, VerifyOtpDto } from './dto'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { AccessJwtAuthGuard } from '@/shared/guards/access-jwt.guard'
import { RefreshJwtAuthGuard } from '@/shared/guards/refresh-jwt.guard'

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
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return this.authService.verifyOtp(data)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('rotate')
  rotate(@Body() data: RotateDto) {
    return this.authService.rotate(data)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  async logout(@Body() data: LogoutDto) {
    return this.authService.logout(data)
  }
}
