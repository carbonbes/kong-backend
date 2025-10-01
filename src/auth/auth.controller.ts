import { Body, Controller, Post } from '@nestjs/common'
import { SignInDto, SignUpDto } from './dto'
import { AuthService } from './auth.service'
import { Public } from '../shared/decorators/public.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @Public()
  async signUp(@Body() data: SignUpDto) {
    return await this.authService.signUp(data)
  }

  @Post('signin')
  @Public()
  async signIn(@Body() data: SignInDto) {
    return await this.authService.signIn(data)
  }
}
