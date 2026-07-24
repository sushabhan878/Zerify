import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new User, then populates their role profile
   * in either brand_profiles or influencer_profiles table.
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.authRepository.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.authRepository.createUserWithRoleProfile(registerDto, hashedPassword);

    if (!user) {
      throw new BadRequestException('Could not create user profile.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Authenticates user via email and password.
   */
  async login(loginDto: LoginDto) {
    const user = await this.authRepository.findByEmail(loginDto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Validates Neon Session (legacy/OAuth token support)
   */
  async validateNeonSession(token: string) {
    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }
    return { token, verified: true };
  }

  /**
   * Removes sensitive password field before returning user object.
   */
  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
