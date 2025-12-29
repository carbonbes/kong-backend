import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { SignInDto, SignUpDto, VerifyOtpDto } from './auth.dtos'
import { AuthService } from './auth.service'
import { CookieOptions, Request, Response } from 'express'
import { AccessJwtAuthGuard } from '@/shared/guards/passport/access-jwt.guard'
import { RefreshJwtAuthGuard } from '@/shared/guards/passport/refresh-jwt.guard'
import { Cookies } from '@/shared/decorators/cookies.decorator'
import { Jwts } from '@/shared/types/jwts'
import { JWTS_COOKIES } from './auth.consts'
import { ClearJwtCookiesOptions, SetJwtCookiesOptions } from './auth.types'
import getDecodedJwt from '@/shared/utils/getDecodedJwt'

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
  async verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwts = await this.authService.verifyOtp(body)

    this.setJwtCookies({ jwts, response })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  async update(
    @Cookies(JWTS_COOKIES) jwts: Jwts,
    @Res({ passthrough: true }) response: Response,
  ) {
    const newJwts = await this.authService.rotate(jwts)

    this.setJwtCookies({ jwts: newJwts, response })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies(JWTS_COOKIES) jwts: Jwts,
    @Res({ passthrough: true }) response: Response,
  ) {
    this.clearJwtCookies({ jwts, response })
  }

  private setJwtCookies({ jwts, response }: SetJwtCookiesOptions) {
    Object.entries(jwts).forEach(([name, value]) => {
      const { exp } = getDecodedJwt(value)

      const options: CookieOptions = {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(exp * 1000),
      }

      response.cookie(name, value, options)
    })
  }

  private clearJwtCookies({ jwts, response }: ClearJwtCookiesOptions) {
    Object.keys(jwts).forEach((name) => response.clearCookie(name))
  }
}
