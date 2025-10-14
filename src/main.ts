import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'
import * as cookieParser from 'cookie-parser'

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO })

  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }))
  app.use(cookieParser())
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
