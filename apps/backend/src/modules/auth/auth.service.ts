import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthRepository } from './auth.repository';
import { RegisterBrandDto } from './dto/register-brand.dto';
import { RegisterInfluencerDto } from './dto/register-influencer.dto';
import { LoginDto } from './dto/login.dto';
import { SendVerificationOtpDto } from './dto/send-verification-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { MailService } from '../mail/mail.service';
import { isProfessionalEmail } from '../../common/utils/email-domain.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  private getGoogleClientId(): string {
    return (
      this.configService.get<string>('GOOGLE_CLIENT_ID') ||
      this.configService.get<string>('YOUTUBE_CLIENT_ID') ||
      ''
    );
  }

  private getGoogleClientSecret(): string {
    return (
      this.configService.get<string>('GOOGLE_CLIENT_SECRET') ||
      this.configService.get<string>('YOUTUBE_CLIENT_SECRET') ||
      ''
    );
  }

  /**
   * Sends 6-digit verification OTP to the user's email address via Nodemailer
   */
  async sendVerificationOtp(dto: SendVerificationOtpDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    // Check if role is BRAND and email is a public domain
    if (dto.role === 'BRAND' && !isProfessionalEmail(cleanEmail)) {
      throw new BadRequestException(
        'Brands must use an official business email address (e.g. name@company.com). Public mail domains such as @gmail.com or @yahoo.com are not permitted.',
      );
    }

    // Check if account already exists
    const existing = await this.authRepository.findByEmail(cleanEmail);
    if (existing) {
      throw new ConflictException('An account with this email address already exists. Please login instead.');
    }

    // Generate 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Save or update verification record in database
    await this.authRepository.upsertEmailVerification(cleanEmail, code, expiresAt);

    // Send email via Nodemailer / Resend
    const mailResult = await this.mailService.sendVerificationOtp(cleanEmail, code, dto.role);

    const isProduction = process.env.NODE_ENV === 'production';

    if (!mailResult.success) {
      this.logger.error(`Failed to deliver OTP to ${cleanEmail}: ${mailResult.error}`);

      if (isProduction) {
        if (mailResult.error?.includes('testing emails to your own email address')) {
          throw new BadRequestException(
            'Resend sandbox limitation: Can only send emails to the account owner (contact.zerify@gmail.com). To send to any email address, please configure SMTP credentials in Render or verify a custom domain in Resend.',
          );
        }
        throw new BadRequestException(
          `Unable to send verification email: ${mailResult.error || 'Email service error'}. Please try again later.`,
        );
      }
    }

    return {
      success: true,
      message: mailResult.success
        ? `A 6-digit verification code has been sent to ${cleanEmail}. Valid for 10 minutes.`
        : `[DEV MODE] Verification code: ${code} (Email delivery failed: ${mailResult.error})`,
      devCode: isProduction ? undefined : code,
    };
  }

  /**
   * Verifies 6-digit OTP code
   */
  async verifyOtp(dto: VerifyOtpDto) {
    const cleanEmail = dto.email.trim().toLowerCase();
    const cleanCode = dto.code.trim();

    const record = await this.authRepository.findEmailVerification(cleanEmail);
    if (!record) {
      throw new BadRequestException('No verification request found for this email. Please request a new code.');
    }

    if (new Date() > new Date(record.expiresAt)) {
      throw new BadRequestException('The verification code has expired. Please request a new code.');
    }

    if (record.code !== cleanCode) {
      throw new BadRequestException('Invalid verification code. Please check and try again.');
    }

    // Mark as verified
    await this.authRepository.markEmailVerified(cleanEmail);

    const verificationToken = this.jwtService.sign(
      { email: cleanEmail, isEmailVerified: true },
      { expiresIn: '1h' },
    );

    return {
      success: true,
      emailVerified: true,
      verificationToken,
      message: 'Email verified successfully!',
    };
  }

  /**
   * Registers a new Brand / Agency account and creates BrandProfile
   */
  async registerBrand(dto: RegisterBrandDto) {
    const cleanEmail = dto.email.trim().toLowerCase();

    // Enforce business email domain for Brands
    if (!isProfessionalEmail(cleanEmail)) {
      throw new BadRequestException(
        'Brands must register with an official business email address. Public mail domains like @gmail.com or @yahoo.com are not permitted.',
      );
    }

    // Enforce that email has been verified
    const verification = await this.authRepository.findEmailVerification(cleanEmail);
    if (!verification || !verification.isVerified) {
      throw new BadRequestException('Please verify your email address before creating an account.');
    }

    const existingUser = await this.authRepository.findByEmail(cleanEmail);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createBrandUser({ ...dto, email: cleanEmail }, hashedPassword);

    if (!user) {
      throw new BadRequestException('Could not create brand account.');
    }

    // Clean up verification record
    await this.authRepository.deleteEmailVerification(cleanEmail);

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
    const cleanEmail = dto.email.trim().toLowerCase();

    // Enforce that email has been verified
    const verification = await this.authRepository.findEmailVerification(cleanEmail);
    if (!verification || !verification.isVerified) {
      throw new BadRequestException('Please verify your email address before creating an account.');
    }

    const existingUser = await this.authRepository.findByEmail(cleanEmail);
    if (existingUser) {
      throw new ConflictException('An account with this email address already exists.');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.authRepository.createInfluencerUser({ ...dto, email: cleanEmail }, hashedPassword);

    if (!user) {
      throw new BadRequestException('Could not create influencer account.');
    }

    // Clean up verification record
    await this.authRepository.deleteEmailVerification(cleanEmail);

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

  /**
   * Google OAuth 2.0 / Google Identity Services authentication & registration
   */
  async googleAuth(dto: GoogleAuthDto) {
    let email = dto.email;
    let name = dto.name;
    let avatarUrl = dto.avatarUrl;
    let googleId = dto.googleId;

    // 1. If Google ID token / credential JWT is provided, verify via Google tokeninfo
    if (dto.credential) {
      try {
        const tokenRes = await fetch(
          `https://oauth2.googleapis.com/tokeninfo?id_token=${dto.credential}`,
        );
        if (tokenRes.ok) {
          const payload = await tokenRes.json();
          email = payload.email || email;
          name = payload.name || payload.given_name || name;
          avatarUrl = payload.picture || avatarUrl;
          googleId = payload.sub || googleId;
        } else {
          this.logger.warn(`Google tokeninfo verification failed: ${await tokenRes.text()}`);
        }
      } catch (err: any) {
        this.logger.error(`Error verifying Google credential: ${err.message}`);
      }
    }

    // 1b. If OAuth accessToken is provided, query Google userinfo
    if (dto.accessToken) {
      try {
        const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${dto.accessToken}` },
        });
        if (userRes.ok) {
          const profile = await userRes.json();
          email = profile.email || email;
          name = profile.name || name;
          avatarUrl = profile.picture || avatarUrl;
          googleId = profile.sub || googleId;
        }
      } catch (err: any) {
        this.logger.error(`Error fetching userinfo with Google access token: ${err.message}`);
      }
    }

    // 2. If OAuth authorization code is provided, exchange for tokens
    if (dto.code) {
      const clientId = this.getGoogleClientId();
      const clientSecret = this.getGoogleClientSecret();
      if (clientId && clientSecret) {
        try {
          const redirectUri =
            dto.redirectUri ||
            this.configService.get<string>('GOOGLE_REDIRECT_URI') ||
            'http://localhost:3000/social/callback';

          const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
              code: dto.code,
              client_id: clientId,
              client_secret: clientSecret,
              redirect_uri: redirectUri,
              grant_type: 'authorization_code',
            }),
          });

          if (tokenRes.ok) {
            const tokenData = await tokenRes.json();
            if (tokenData.access_token) {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
              });
              if (userRes.ok) {
                const profile = await userRes.json();
                email = profile.email || email;
                name = profile.name || name;
                avatarUrl = profile.picture || avatarUrl;
                googleId = profile.sub || googleId;
              }
            }
          }
        } catch (err: any) {
          this.logger.error(`Error exchanging Google authorization code: ${err.message}`);
        }
      }
    }

    if (!email) {
      throw new BadRequestException('Unable to retrieve a verified email address from Google.');
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Search for existing user
    let user = await this.authRepository.findByEmail(cleanEmail);

    if (user) {
      // Existing user found -> successfully log in
      const payload = { sub: user.id, email: user.email, role: user.role };
      return {
        success: true,
        isNewUser: false,
        accessToken: this.jwtService.sign(payload),
        user: this.sanitizeUser(user),
      };
    }

    // 4. User does not exist yet
    // If the request was strictly a login attempt and no role was specified, notify frontend that registration is required
    if (dto.action === 'login' && !dto.role) {
      return {
        success: true,
        isNewUser: true,
        requiresRegistration: true,
        googleProfile: {
          email: cleanEmail,
          name: name || cleanEmail.split('@')[0],
          avatarUrl,
          googleId,
        },
        message: 'No Zerify account found for this Google email. Please complete registration by selecting your role.',
      };
    }

    // Otherwise create the new account
    const targetRole = dto.role || UserRole.INFLUENCER;

    if (targetRole === UserRole.BRAND && !isProfessionalEmail(cleanEmail)) {
      throw new BadRequestException(
        'Brands must register with an official business email (e.g. name@company.com). Public mail domains like @gmail.com are not permitted for Brand accounts.',
      );
    }

    user = await this.authRepository.createGoogleUser({
      email: cleanEmail,
      name: name || cleanEmail.split('@')[0],
      avatarUrl,
      googleId,
      role: targetRole,
    });

    if (!user) {
      throw new BadRequestException('Failed to create account with Google credentials.');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      success: true,
      isNewUser: true,
      accessToken: this.jwtService.sign(payload),
      user: this.sanitizeUser(user),
    };
  }

  /**
   * Generates Google OAuth 2.0 authorization URL
   */
  getGoogleAuthUrl(redirectUri: string, state: string): string {
    const clientId = this.getGoogleClientId();
    if (!clientId) {
      throw new BadRequestException(
        'Google Client ID is not configured. Please set GOOGLE_CLIENT_ID or YOUTUBE_CLIENT_ID.',
      );
    }

    const scopes = ['openid', 'profile', 'email'].join(' ');
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'code');
    url.searchParams.append('scope', scopes);
    url.searchParams.append('state', state);
    url.searchParams.append('access_type', 'offline');
    url.searchParams.append('prompt', 'select_account consent');

    return url.toString();
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
