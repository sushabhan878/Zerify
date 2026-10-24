import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthRepository } from '../auth.repository';

import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authRepository: AuthRepository) {
    const primarySecret = process.env.JWT_SECRET || 'zerify-secret-key-super-secure-jwt';
    const fallbackSecrets = [
      primarySecret,
      'zerify-dev-secret-key-super-secure',
      'zerify-secret-key-super-secure-jwt',
    ];

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: process.env.NODE_ENV !== 'production',
      secretOrKeyProvider: (
        _req: any,
        rawJwtToken: string,
        done: (err: any, secret?: string) => void,
      ) => {
        for (const sec of fallbackSecrets) {
          try {
            jwt.verify(rawJwtToken, sec, { ignoreExpiration: true });
            return done(null, sec);
          } catch {
            // continue checking other secrets
          }
        }
        return done(null, primarySecret);
      },
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.authRepository.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User no longer exists or invalid token');
    }
    return user;
  }
}
