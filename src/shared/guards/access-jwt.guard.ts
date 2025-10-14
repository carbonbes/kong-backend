import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class AccessJwtAuthGuard extends AuthGuard('access-jwt') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
