import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

/**
 * Role-based access control for financial admin operations (TRD §24).
 *
 * Only ADMIN users may issue refunds, retry payouts, resolve disputes, or
 * view the financial admin dashboard.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin role required for this operation');
    }

    return true;
  }
}
