import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import {
  initializeTransactionalContext,
  StorageDriver,
} from 'typeorm-transactional'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO })

  const app = await NestFactory.create(AppModule)
  app.useGlobalPipes(new ValidationPipe({ transform: true }))
  await app.listen(process.env.PORT ?? 3000)
}

bootstrap()
