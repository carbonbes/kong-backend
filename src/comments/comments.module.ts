import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from '@/comments/entities'
import { CommentsController } from './comments.controller'

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsService],
  controllers: [CommentsController],
  exports: [CommentsService],
})
export class CommentsModule {}
