import { ExecutionContext, Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class RefreshJwtAuthGuard extends AuthGuard('refresh-jwt-strategy') {
  canActivate(context: ExecutionContext) {
    return super.canActivate(context)
  }
}
