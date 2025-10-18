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
import { JWTS_COOKIE } from './auth.consts'
import { EncodedJwt } from '../shared/types'

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
    const jwts = await this.authService.verifyOtp(data)
    this.authService.setJwtsCookie({ res, jwts })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  async update(
    @Cookies(JWTS_COOKIE) jwts: EncodedJwt[],
    @Res({ passthrough: true }) res: Response,
  ) {
    const newJwts = await this.authService.update(jwts)
    this.authService.setJwtsCookie({ res, jwts: newJwts })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies(JWTS_COOKIE) jwts: EncodedJwt[],
    @Res({ passthrough: true }) res: Response,
  ) {
    this.authService.logout(jwts)
    this.authService.removeJwtsCookie(res)
  }
}
