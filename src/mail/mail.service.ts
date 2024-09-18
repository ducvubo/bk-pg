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

  async sendResetPassword(email: string, otp) {
    await this.mailerService.sendMail({
      to: email,
      from: 'PASSGO',
      subject: 'Đặt lại mật khẩu',
      template: 'forgot-password',
      context: {
        otp: otp
      }
    })
  }

  async sendMailComfirmBookTable(
    email: string,
    phone: string,
    name_user: string,
    name_restaurant: string,
    hour: string,
    date: string,
    url: string,
    number_adults: number,
    number_children: number,
    note?: string
  ) {
    await this.mailerService.sendMail({
      to: email,
      from: 'PASSGO',
      subject: 'Xác nhận đặt bàn',
      template: 'confirm-book-table',
      context: {
        number_adults,
        number_children,
        url,
        email,
        phone,
        name_user,
        name_restaurant,
        hour,
        date,
        note: note || ''
      }
    })
  }
}
