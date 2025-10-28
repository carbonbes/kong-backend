import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import * as process from 'node:process'

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        defaults: {
          from: 'Kong',
        },
        transport: {
          host: configService.get<string>('MAILER_HOST'),
          port: Number(configService.get('MAILER_PORT')),
          secure: !!process.env.PROD,
          auth: {
            user: configService.get<string>('MAILER_USER'),
            pass: configService.get<string>('MAILER_PASS'),
          },
        },
      }),
    }),
  ],

  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
