import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const Cookies = createParamDecorator(
  (
    keys: string | string[] | undefined,
    ctx: ExecutionContext,
  ): Record<string, any> => {
    const request = ctx.switchToHttp().getRequest<Request>()

    if (!keys) {
      return request.cookies
    } else if (typeof keys === 'string') {
      return { keys: request.cookies[keys] }
    }

    return keys.reduce((obj, key) => {
      obj[key] = request.cookies[key]

      return obj
    }, {})
  },
)
