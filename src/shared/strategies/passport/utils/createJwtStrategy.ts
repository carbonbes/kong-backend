import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-jwt'
import { Request } from 'express'
import { User } from '@/users/users.types'

declare module 'express-serve-static-core' {
  interface Request {
    user: User
  }
}

interface ExtractJwtFromCookieOptions {
  request: Request
  cookieName: string
}

interface CreateCommonJwtStrategyOptions {
  name: string
  cookieName: string
}

const extractJwtFromCookie = ({
  request,
  cookieName,
}: ExtractJwtFromCookieOptions) => request.cookies[cookieName]

export const CreateJwtStrategy = ({
  name,
  cookieName,
}: CreateCommonJwtStrategyOptions) => {
  abstract class JwtStrategy extends PassportStrategy(Strategy, name) {
    protected constructor(secretOrKey: string) {
      super({
        jwtFromRequest: (request: Request) =>
          extractJwtFromCookie({ request, cookieName }),
        ignoreExpiration: false,
        secretOrKey,
      })
    }
  }

  return JwtStrategy
}
