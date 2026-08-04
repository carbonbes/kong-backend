import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { UsersService } from '@/users/users.service'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-custom'

@Injectable()
export class SessionStrategy extends PassportStrategy(
  Strategy,
  'session-strategy',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super()
  }

  async validate() {}
}
