import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Cookies = createParamDecorator(
  (keys: string | string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    if (typeof keys === 'string') {
      return request.cookies[keys]
    } else if (Array.isArray(keys)) {
      return keys.map((key: string) => request.cookies[key])
    }

    return request.cookies
  },
)
