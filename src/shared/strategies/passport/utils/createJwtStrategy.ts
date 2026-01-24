import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { User } from '@/users/users.types'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

interface CreateCommonJwtStrategyOptions {
  name: string
}

export const CreateJwtStrategy = ({ name }: CreateCommonJwtStrategyOptions) => {
  abstract class JwtStrategy extends PassportStrategy(Strategy, name) {
    protected constructor(secretOrKey: string) {
      super({
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey,
      })
    }
  }

  return JwtStrategy
}
