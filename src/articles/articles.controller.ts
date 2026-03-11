import { Controller, Delete, Get, Post } from '@nestjs/common'
import { ArticlesService } from '@/articles/articles.service'

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post('create')
  create() {
    return this.articlesService.create()
  }

  @Get(':id')
  findUnique() {
    return this.articlesService.findUnique()
  }

  @Get('')
  findMany() {
    return this.articlesService.findMany()
  }

  @Post(':id')
  update() {
    return this.articlesService.update()
  }

  @Delete(':id')
  delete() {
    return this.articlesService.delete()
  }
}
