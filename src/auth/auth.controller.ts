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
import { CookieOptions, Request, Response } from 'express'
import { AccessJwtAuthGuard } from '../shared/guards/access-jwt.guard'
import { RefreshJwtAuthGuard } from '../shared/guards/refresh-jwt.guard'
import { Cookies } from '../shared/decorators/cookies.decorator'
import { EncodedJwt } from '../jwts/jwts.types'
import {
  ACCESS_TOKEN_NAME,
  CREDENTIAL_JWTS,
  REFRESH_TOKEN_NAME,
} from '../shared/consts'
import { SetCredentialsCookieOptions } from './auth.types'

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

    this.setCredentialsCookie({ credentials: jwts, res })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  async update(
    @Cookies(CREDENTIAL_JWTS) credentials: EncodedJwt[],
    @Res({ passthrough: true }) res: Response,
  ) {
    const jwts = await this.authService.update(credentials)

    this.setCredentialsCookie({ credentials: jwts, res })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies(CREDENTIAL_JWTS) credentials: EncodedJwt[],
    @Res({ passthrough: true }) res: Response,
  ) {
    this.authService.logout(credentials)
    this.removeCredentialsCookie(res)
  }

  private setCredentialsCookie({
    credentials: { access_token, refresh_token },
    res,
  }: SetCredentialsCookieOptions) {
    const options: CookieOptions = {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    }

    res.cookie(ACCESS_TOKEN_NAME, access_token, options)
    res.cookie(REFRESH_TOKEN_NAME, refresh_token, options)
  }

  private removeCredentialsCookie(res: Response) {
    res.clearCookie(ACCESS_TOKEN_NAME)
    res.clearCookie(REFRESH_TOKEN_NAME)
  }
}
