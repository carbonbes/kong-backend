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
import { User } from '@/users/entities'
import { CreateOptions } from '@/articles/types'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() body: CreateArticleDto, @Session() user: User) {
    const options: CreateOptions = { ...body, author: user }

    return this.articlesService.create(options)
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.articlesService.findOne({ id })
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() body: UpdateArticleDto) {
    return this.articlesService.update({ where: { id }, data: body })
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.articlesService.delete({ id })
  }
}
