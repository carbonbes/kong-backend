import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Cookies = createParamDecorator(
  (key: string | string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    if (typeof key === 'string') {
      return request.cookies[key]
    } else if (Array.isArray(key)) {
      return key.map((key: string) => request.cookies[key])
    }

    return request.cookies
  },
)
