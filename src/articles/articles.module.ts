import { Module } from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { ArticlesController } from './articles.controller'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Article } from '@/articles/entities'
import { CommentsModule } from '@/comments/comments.module'

@Module({
  imports: [TypeOrmModule.forFeature([Article]), CommentsModule],
  providers: [ArticlesService],
  controllers: [ArticlesController],
  exports: [ArticlesService],
})
export class ArticlesModule {}
