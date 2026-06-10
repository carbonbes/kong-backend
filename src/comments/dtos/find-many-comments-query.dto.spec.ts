import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { FindManyCommentsQueryDto } from './find-many-comments-query.dto'

describe('FindManyCommentsQueryDto', () => {
  const validationPipe = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: FindManyCommentsQueryDto,
  }

  describe('should success if query is valid', async () => {
    test.for([
      [{ after: 'cursor' }],
      [{ articleId: 1 }],
      [{ authorId: 1 }],
      [{ before: 'cursor' }],
      [{ limit: 10 }],
      [{ limit: 50 }],
      [{ orderBy: 'asc' }],
      [{ orderBy: 'desc' }],
      [{ parentCommentId: 1 }],
      [{ sortBy: 'rating' }],
      [{ sortBy: 'createdAt' }],
    ])(
      '$1',
      async ([a]) =>
        await expect(validationPipe.transform(a, metadata)).resolves.toEqual(a),
    )
  })

  describe('should throw a BadRequestException if query is invalid', async () => {
    test.for([
      [{ after: 1 }],
      [{ after: '' }],
      [{ articleId: '' }],
      [{ authorId: '' }],
      [{ before: 1 }],
      [{ before: '' }],
      [{ limit: 9 }],
      [{ limit: 51 }],
      [{ limit: '' }],
      [{ orderBy: 1 }],
      [{ orderBy: '' }],
      [{ orderBy: 'as' }],
      [{ parentCommentId: '' }],
      [{ sortBy: 1 }],
      [{ sortBy: '' }],
      [{ sortBy: 'ratin' }],
    ])(
      '$1',
      async ([a]) =>
        await expect(validationPipe.transform(a, metadata)).rejects.toThrow(
          BadRequestException,
        ),
    )
  })
})
