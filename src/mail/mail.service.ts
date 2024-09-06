import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendUserConfirmation(email: string, otp: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'PASSGO',
      subject: 'Xác nhận tài khoản',
      template: 'confirmation',
      context: {
        otp: otp,
        email: email
      }
    })
  }

  async sendPassword(email: string, password: string) {
    await this.mailerService.sendMail({
      to: email,
      from: 'PASSGO',
      subject: 'Mật khẩu tạm thời',
      template: 'password',
      context: {
        password: password
      }
    })
  }
}
