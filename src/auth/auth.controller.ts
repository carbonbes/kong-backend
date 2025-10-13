import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { AccessJwtAuthGuard } from './access-jwt.guard'
import { RefreshJwtAuthGuard } from './refresh-jwt.guard'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() data: SignUpDto) {
    return await this.authService.signUp(data)
  }

  @Post('signin')
  async signIn(@Body() data: SignInDto) {
    return await this.authService.signIn(data)
  }

  @Post('verify-otp')
  async verifyOtp(@Body() data: VerifyOtpDto) {
    return await this.authService.verifyOtp(data)
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  async update(@Headers('Authorization') authorization: string) {
    return await this.authService.update(authorization)
  }
}
