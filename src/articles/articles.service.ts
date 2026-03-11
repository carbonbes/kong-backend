import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  create() {
    return this.prismaService.article.create({
      data: { authorId: 1, content: [{ type: 'paragraph', value: 'Привет!' }] },
    })
  }

  findUnique() {
    return this.prismaService.article.findUnique({ where: { id: 1 } })
  }

  findMany() {
    return this.prismaService.article.findMany({ where: { authorId: 1 } })
  }

  update() {
    return this.prismaService.article.update({
      where: { id: 1 },
      data: { content: [{ type: 'paragraph', value: 'Как дела?' }] },
    })
  }

  delete() {
    return this.prismaService.article.delete({ where: { id: 1 } })
  }
}
