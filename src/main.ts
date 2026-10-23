import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import cookieParser from 'cookie-parser'
import fs from 'node:fs'
import { ConfigService } from '@nestjs/config'

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('certs/private-key.pem'),
    cert: fs.readFileSync('certs/public.pem'),
  }

  const app = await NestFactory.create(AppModule, { httpsOptions })

  const configService = app.get(ConfigService)

  const origin = configService.get<string>('cors.origin')!
  const port = Number(configService.get('server.port'))

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))

  app.enableCors({
    credentials: true,
    origin,
  })

  app.use(cookieParser())

  await app.listen(port)
}

bootstrap()
