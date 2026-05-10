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
      [{ cursor: 'cursor' }],
      [{ limit: 10 }],
      [{ limit: 50 }],
      [{ orderBy: 'ASC' }],
      [{ orderBy: 'DESC' }],
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
      [{ cursor: 1 }],
      [{ cursor: '' }],
      [{ limit: 9 }],
      [{ limit: 51 }],
      [{ limit: '' }],
      [{ orderBy: 1 }],
      [{ orderBy: '' }],
      [{ orderBy: 'AS' }],
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
