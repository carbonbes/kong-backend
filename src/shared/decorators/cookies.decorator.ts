import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const Cookies = createParamDecorator(
  (key: string | string[], ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()

    if (typeof key === 'string') {
      return { [key]: request.cookies[key] }
    } else if (Array.isArray(key)) {
      return key.reduce((obj, key) => {
        obj[key] = request.cookies[key]

        return obj
      }, {})
    }

    return request.cookies
  },
)
