import { Module } from '@nestjs/common'
import { CommentsService } from './comments.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comment } from '@/comments/entities'

@Module({
  imports: [TypeOrmModule.forFeature([Comment])],
  providers: [CommentsService],
  exports: [CommentsService],
})
export class CommentsModule {}
