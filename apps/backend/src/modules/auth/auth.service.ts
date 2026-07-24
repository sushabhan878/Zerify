import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterBrandDto } from './dto/register-brand.dto';
import { RegisterInfluencerDto } from './dto/register-influencer.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new Brand / Agency account and creates BrandProfile
   */
  async registerBrand(dto: RegisterBrandDto) {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createBrandUser(dto, hashedPassword);

    if (!user) {
      throw new BadRequestException('Could not create brand account.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Registers a new Influencer / Creator account and creates InfluencerProfile
   */
  async registerInfluencer(dto: RegisterInfluencerDto) {
    const existingUser = await this.authRepository.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createInfluencerUser(dto, hashedPassword);

    if (!user) {
      throw new BadRequestException('Could not create influencer account.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Brand specific login requiring BRAND role
   */
  async loginBrand(dto: LoginDto) {
    const user = await this.validateCredentials(dto);
    if (user.role !== UserRole.BRAND) {
      throw new UnauthorizedException('This account is registered as an Influencer. Please use Influencer login.');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Influencer specific login requiring INFLUENCER role
   */
  async loginInfluencer(dto: LoginDto) {
    const user = await this.validateCredentials(dto);
    if (user.role !== UserRole.INFLUENCER) {
      throw new UnauthorizedException('This account is registered as a Brand. Please use Brand portal login.');
    }
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Generic login for any registered role
   */
  async login(dto: LoginDto) {
    const user = await this.validateCredentials(dto);
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  private async validateCredentials(dto: LoginDto) {
    const user = await this.authRepository.findByEmail(dto.email);
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return user;
  }

  private sanitizeUser(user: any) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}
