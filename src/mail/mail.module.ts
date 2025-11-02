import { Module } from '@nestjs/common'
import { MailService } from './mail.service'
import { MailerModule } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'
import { MailerConfig } from '@/config/types'

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<MailerConfig>) => ({
        transport: {
          host: configService.get('host'),
          port: configService.get('port'),
          secure: !!process.env.PROD,
          auth: {
            user: configService.get('user'),
            pass: configService.get('pass'),
          },
        },
      }),
    }),
  ],

  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
