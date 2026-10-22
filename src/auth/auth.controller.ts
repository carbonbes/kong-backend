import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { ResendOtpDto, SignInDto, SignUpDto, VerifyOtpDto } from './dtos'
import { AuthService } from './auth.service'
import type { Request, Response } from 'express'
import { type EncodedJwt } from '@/shared/types'
import { Public, RefreshTokenCookie } from '@/shared/decorators'
import { RefreshJwtAuthGuard } from '@/shared/guards'
import { clearJwtCookie, setJwtCookie } from '@/auth/utils'

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
  @Post('resend-otp')
  resendOtp(@Body() body: ResendOtpDto) {
    return this.authService.resendOtp(body)
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken, refreshToken, user } =
      await this.authService.verifyOtp(body)

    setJwtCookie({ response, name: 'kong_access_token', value: accessToken })
    setJwtCookie({ response, name: 'kong_refresh_token', value: refreshToken })

    return { user }
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  async update(
    @RefreshTokenCookie() oldRefreshToken: EncodedJwt,
    @Res({ passthrough: true }) response: Response,
  ) {
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.update(oldRefreshToken)

    setJwtCookie({ response, name: 'kong_access_token', value: newAccessToken })

    setJwtCookie({
      response,
      name: 'kong_refresh_token',
      value: newRefreshToken,
    })
  }

  @Post('logout')
  async logout(
    @RefreshTokenCookie() refreshToken: EncodedJwt,
    @Res({ passthrough: true }) response: Response,
  ) {
    await this.authService.logout(refreshToken)

    clearJwtCookie({ response, name: 'kong_access_token' })
    clearJwtCookie({ response, name: 'kong_refresh_token' })
  }
}
