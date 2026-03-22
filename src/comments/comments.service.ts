import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import {
  CreateOptions,
  CreateReturn,
  DeleteOptions,
  DeleteReturn,
  FindManyOptions,
  FindManyReturn,
  FindOneOptions,
  FindOneReturn,
  UpdateOptions,
  UpdateReturn,
} from '@/comments/types'
import { Comment } from '@/comments/entities'

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  create(options: CreateOptions): CreateReturn {
    return this.commentsRepository.save(options)
  }

  findOne(options: FindOneOptions): FindOneReturn {
    return this.commentsRepository.findOneBy(options)
  }

  findMany(options: FindManyOptions): FindManyReturn {
    return this.commentsRepository.find(options)
  }

  async update(options: UpdateOptions): UpdateReturn {
    const { where, data } = options

    await this.commentsRepository.update(where, data)

    return (await this.findOne(where))!
  }

  async delete(options: DeleteOptions): DeleteReturn {
    const comment = await this.findOne(options)

    if (!comment) {
      throw new NotFoundException()
    }

    await this.commentsRepository.delete(options)

    return comment
  }
}
