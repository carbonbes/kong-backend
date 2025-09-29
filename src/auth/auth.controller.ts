import { Body, Controller, Post } from '@nestjs/common'
import { UsersService } from '../users/users.service'
import { SignUpDto } from './dto'
import { plainToInstance } from 'class-transformer'
import { UserResponseDto } from '../users/dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signup')
  async signUp(@Body() data: SignUpDto) {
    const user = await this.usersService.create(data)

    return plainToInstance(UserResponseDto, user, {
      groups: user.email === data.email ? ['owner'] : undefined,
    })
  }
}
