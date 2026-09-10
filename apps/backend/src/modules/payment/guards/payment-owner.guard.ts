import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';

/**
 * Ensures the authenticated user is the payer of the payment addressed by
 * the request (or an admin). Attaches the payment to the request for the
 * controller.
 */
@Injectable()
export class PaymentOwnerGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) throw new ForbiddenException('Authentication required');

    const paymentId = request.params.paymentId;
    if (!paymentId) return true;

    const payment = await this.prisma.zerifyPayment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) throw new NotFoundException('Payment not found');

    if (payment.userId !== user.id && user.role !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to access this payment');
    }

    request.payment = payment;
    return true;
  }
}
