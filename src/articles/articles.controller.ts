import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common'
import { ArticlesService } from './articles.service'
import { CreateArticleDto, UpdateArticleDto } from './dtos'
import { Session } from '@/shared/decorators'
import type { User } from '@/users/types'
import { CreateOptions } from '@/articles/types'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() body: CreateArticleDto, @Session() { id }: User) {
    const options: CreateOptions = { data: { ...body, authorId: id } }

    return this.articlesService.create(options)
  }

  @Get(':id')
  findUnique(@Param('id') id: number) {
    return this.articlesService.findUnique({ where: { id } })
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: UpdateArticleDto) {
    return this.articlesService.update({ where: { id }, data: body })
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.articlesService.delete({ where: { id } })
  }
}
