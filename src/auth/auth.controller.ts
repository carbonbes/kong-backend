import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Headers,
  UseGuards,
} from '@nestjs/common'
import {
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifyOtpDto,
} from './auth.dtos'
import { AuthService } from './auth.service'
import { Request } from 'express'
import { EncodedJwt } from '@/shared/types'
import { Public } from '@/shared/decorators/public.decorator'
import { RefreshJwtAuthGuard } from '@/shared/guards/passport/refresh-jwt.guard'
import { LogoutOptions } from '@/auth/auth.types'

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
  @Post('verify-otp')
  verifyOtp(@Body() body: VerifyOtpDto) {
    return this.authService.verifyOtp(body)
  }

  @Get('me')
  async me(@Req() req: Request) {
    return req.user
  }

  @Public()
  @UseGuards(RefreshJwtAuthGuard)
  @Post('update')
  update(@Headers('Authorization') refreshToken: EncodedJwt) {
    return this.authService.update(refreshToken)
  }

  @Post('logout')
  logout(
    @Headers('Authorization') accessToken: EncodedJwt,
    @Body() { refreshToken }: RefreshTokenDto,
  ) {
    const jwts: LogoutOptions = { accessToken, refreshToken }

    return this.authService.logout(jwts)
  }
}
