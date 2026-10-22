import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { ACCESS_TOKEN_COOKIE_NAME } from '@/shared/consts'

export const AccessTokenCookie = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    return request.cookies[ACCESS_TOKEN_COOKIE_NAME]
  },
)
