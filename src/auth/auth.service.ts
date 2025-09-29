import { Injectable } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { SignUpInput } from './interface'

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signUp(data: SignUpInput) {
    return this.usersService.create(data)
  }
}
