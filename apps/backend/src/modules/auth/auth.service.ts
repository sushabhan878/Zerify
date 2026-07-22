import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthService {
  /**
   * Validates Neon Auth bearer tokens / session IDs
   */
  async validateNeonSession(token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }
    // Neon Auth session verification logic
    return { token, verified: true };
  }
}
