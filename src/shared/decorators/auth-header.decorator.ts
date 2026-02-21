import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { EncodedJwt } from '@/shared/types'

export const AuthHeader = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    return request.headers.authorization.replace('Bearer ', '') as EncodedJwt
  },
)
