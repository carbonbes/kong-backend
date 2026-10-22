import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REFRESH_TOKEN_COOKIE_NAME } from '@/shared/consts'

export const RefreshTokenCookie = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    return request.cookies[REFRESH_TOKEN_COOKIE_NAME]
  },
)
