import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private etherealTransporter: nodemailer.Transporter | null = null;

  constructor(private readonly configService: ConfigService) {
    this.initTransporter();
  }

  private async initTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    const secure = this.configService.get<string>('SMTP_SECURE') === 'true' || port === 465;

    if (host && user && pass) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: { user, pass },
        });
        this.logger.log(`Nodemailer SMTP Transporter configured for ${host}:${port}`);
      } catch (err: any) {
        this.logger.warn(`Failed to initialize primary SMTP transporter: ${err.message}`);
      }
    } else {
      this.logger.log('No SMTP credentials in environment. MailService will use Ethereal / Dev logger mode.');
    }
  }

  private async getActiveTransporter(): Promise<nodemailer.Transporter | null> {
    if (this.transporter) {
      return this.transporter;
    }

    if (!this.etherealTransporter) {
      try {
        const testAccount = await nodemailer.createTestAccount();
        this.etherealTransporter = nodemailer.createTransport({
          host: testAccount.smtp.host,
          port: testAccount.smtp.port,
          secure: testAccount.smtp.secure,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        this.logger.log(`Created Ethereal test transporter: ${testAccount.user}`);
      } catch (err: any) {
        this.logger.warn(`Could not create Ethereal test account: ${err.message}. Using console logger fallback.`);
        return null;
      }
    }

    return this.etherealTransporter;
  }

  /**
   * Sends 6-digit Email Verification OTP to the recipient
   */
  async sendVerificationOtp(
    to: string,
    code: string,
    role?: string,
  ): Promise<{ success: boolean; previewUrl?: string; error?: string }> {
    const from = this.configService.get<string>('EMAIL_FROM') || '"Zerify Verification" <no-reply@zerify.io>';
    const isBrand = role === 'BRAND';
    const roleLabel = isBrand ? 'Brand & Agency' : 'Creator & Influencer';

    const subject = `Your Zerify Verification Code: ${code}`;
    const text = `Welcome to Zerify! Your email verification code is: ${code}. This code expires in 10 minutes. If you did not request this, please ignore this email.`;

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Zerify Verification</title>
</head>
<body style="margin: 0; padding: 0; background-color: #07090e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #07090e; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 540px; background-color: #0f131d; border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          <!-- Header -->
          <tr>
            <td style="padding: 36px 36px 20px 36px; text-align: center; background: linear-gradient(180deg, rgba(147, 51, 234, 0.15) 0%, rgba(15, 19, 29, 0) 100%);">
              <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                <span style="color: #c084fc;">Zerify</span> Security
              </h1>
              <p style="margin: 8px 0 0 0; font-size: 13px; color: #94a3b8; font-weight: 500;">
                ${roleLabel} Account Verification
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 20px 36px 36px 36px;">
              <p style="margin: 0 0 20px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                Hello,
              </p>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #cbd5e1;">
                Please use the following single-use verification code to verify your email address and continue setting up your Zerify ${isBrand ? 'Brand' : 'Creator'} account:
              </p>

              <!-- OTP Code Display Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 28px 0;">
                <tr>
                  <td align="center" style="background: linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 16px; padding: 24px;">
                    <div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #c084fc; margin-bottom: 8px;">
                      Verification Code
                    </div>
                    <div style="font-family: 'Courier New', Courier, monospace; font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffffff; text-shadow: 0 0 20px rgba(192, 132, 252, 0.5);">
                      ${code}
                    </div>
                    <div style="font-size: 12px; color: #94a3b8; margin-top: 10px;">
                      Expires in 10 minutes
                    </div>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 20px 0; font-size: 13px; line-height: 20px; color: #64748b;">
                If you did not request this verification, you can safely ignore this email. Never share your verification code with anyone. Zerify representatives will never ask you for your code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; border-top: 1px solid rgba(255,255,255,0.06); background-color: #090c14; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #475569;">
                &copy; ${new Date().getFullYear()} Zerify Inc. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // High visibility console logging for dev / test verification
    this.logger.log(`\n======================================================\n📧 [ZERIFY EMAIL VERIFICATION OTP]\nTo: ${to}\nRole: ${role || 'UNKNOWN'}\nVerification Code: ${code}\nValid for: 10 minutes\n======================================================\n`);

    // 1. Try Resend REST API if API key is provided (No react-dom/server dependency required)
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        const fromAddress = this.configService.get<string>('EMAIL_FROM') || 'Zerify <onboarding@resend.dev>';
        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${resendApiKey.trim()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [to],
            subject,
            text,
            html,
          }),
        });

        const data: any = await response.json().catch(() => ({}));
        if (!response.ok || data.error) {
          const errMsg = data.error?.message || data.message || `HTTP ${response.status}`;
          this.logger.error(`Resend API Error: ${errMsg}`);
          return { success: false, error: errMsg };
        } else {
          this.logger.log(`Verification email sent successfully via Resend API to ${to} (ID: ${data.id})`);
          return { success: true };
        }
      } catch (err: any) {
        this.logger.error(`Resend API request failed: ${err.message}`);
        return { success: false, error: err.message };
      }
    }

    // 2. Try Nodemailer / SMTP
    try {
      const activeTransporter = await this.getActiveTransporter();
      if (activeTransporter) {
        const info = await activeTransporter.sendMail({
          from,
          to,
          subject,
          text,
          html,
        });

        const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
        if (previewUrl) {
          this.logger.log(`Ethereal Email Preview URL: ${previewUrl}`);
        }
        return { success: true, previewUrl };
      }
    } catch (err: any) {
      this.logger.error(`Failed to send email via transporter: ${err.message}`);
    }

    return { success: true };
  }
}
