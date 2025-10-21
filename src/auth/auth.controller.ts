import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dto'
import { AuthService } from './auth.service'
import { Request, Response } from 'express'
import { AccessJwtAuthGuard, RefreshJwtAuthGuard } from '../shared/guards'
import { Cookies } from '../shared/decorators'
import { CREDENTIALS } from './auth.consts'
import { Credentials } from '../shared/types'

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
  async verifyOtp(
    @Body() data: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const credentials = await this.authService.verifyOtp(data)
    this.authService.setCredentialsCookie({ res, credentials })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('rotate')
  async rotate(
    @Cookies(CREDENTIALS) credentials: Credentials,
    @Res({ passthrough: true }) res: Response,
  ) {
    const newCredentials = await this.authService.rotate(credentials)
    this.authService.setCredentialsCookie({ res, credentials: newCredentials })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies(CREDENTIALS) credentials: Credentials,
    @Res({ passthrough: true }) res: Response,
  ) {
    this.authService.logout(credentials)
    this.authService.removeCredentialsCookie(res)
  }
}
