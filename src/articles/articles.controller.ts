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

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  create(@Body() body: CreateArticleDto) {
    return this.articlesService.create({ data: body })
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
