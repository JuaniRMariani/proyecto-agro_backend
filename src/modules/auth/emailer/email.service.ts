import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private htmlTemplate: string;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });

    // Cargar el template HTML con ruta relativa desde src
    const templatePath = path.join(
      process.cwd(),
      'src',
      'modules',
      'auth',
      'emailer',
      'verification-code.template.html',
    );
    this.htmlTemplate = fs.readFileSync(templatePath, 'utf-8');
  }

  async sendPasswordResetCode(email: string, code: string): Promise<void> {
    const htmlContent = this.htmlTemplate.replace('{{CODE}}', code);

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_FROM'),
      to: email,
      subject: '🌾 Código de Verificación - Proyecto Agro',
      html: htmlContent,
    });
  }
}
