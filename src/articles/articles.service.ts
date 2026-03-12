import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/prisma/prisma.service'
import {
  CreateOptions,
  CreateReturn,
  FindUniqueOptions,
  FindUniqueReturn,
  FindManyOptions,
  FindManyReturn,
  UpdateOptions,
  UpdateReturn,
  DeleteOptions,
  DeleteReturn,
} from '@/articles/types'

@Injectable()
export class ArticlesService {
  constructor(private readonly prismaService: PrismaService) {}

  create(options: CreateOptions): CreateReturn {
    return this.prismaService.article.create(options)
  }

  findUnique(options: FindUniqueOptions): FindUniqueReturn {
    return this.prismaService.article.findUnique(options)
  }

  findMany(options: FindManyOptions): FindManyReturn {
    return this.prismaService.article.findMany(options)
  }

  update(options: UpdateOptions): UpdateReturn {
    return this.prismaService.article.update(options)
  }

  delete(options: DeleteOptions): DeleteReturn {
    return this.prismaService.article.delete(options)
  }
}
