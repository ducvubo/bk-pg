import { MailerModule } from '@nestjs-modules/mailer'
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter'
import { Module } from '@nestjs/common'
import { join } from 'path'
import { MailService } from './mail.service'
import { MailController } from './mail.controller'
import { ConfigService } from '@nestjs/config'

@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('EMAIL_HOST'),
          secure: false,
          auth: {
            user: configService.get<string>('SENDER_EMAIL'),
            pass: configService.get<string>('PASSWORD_EMAIL')
          }
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true
          }
        }
        // preview: true
      }),
      inject: [ConfigService]
    })
  ],
  controllers: [MailController],
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
