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
import { Jwts } from '@/shared/types/jwts'
import { JWTS_COOKIES } from '@/auth/auth.consts'

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
    @Body() otp: VerifyOtpDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.verifyOtp({ otp, response })
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
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.rotate({ jwts, response })
  }

  @UseGuards(AccessJwtAuthGuard)
  @Post('logout')
  async logout(
    @Cookies(JWTS_COOKIES) jwts: Jwts,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.logout({ jwts, response })
  }
}
