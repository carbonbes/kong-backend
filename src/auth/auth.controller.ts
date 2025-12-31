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
import { Request, Response } from 'express'
import { AccessJwtAuthGuard } from '@/shared/guards/passport/access-jwt.guard'
import { RefreshJwtAuthGuard } from '@/shared/guards/passport/refresh-jwt.guard'
import { Cookies } from '@/shared/decorators/cookies.decorator'
import { Jwts } from '@/shared/types'
import { JWTS_COOKIES } from './auth.consts'

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
  verifyOtp(
    @Body() body: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyOtp({ body, res })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  update(
    @Cookies(JWTS_COOKIES) jwts: Jwts,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.rotate({ jwts, res })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  logout(
    @Cookies(JWTS_COOKIES) jwts: Jwts,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.logout({ jwts, res })
  }
}
