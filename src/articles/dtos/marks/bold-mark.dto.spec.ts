import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { ParagraphNodeDto } from '@/articles/dtos/nodes/paragraph-node.dto'

describe('BoldMarkDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: ParagraphNodeDto,
  }

  test('should success if is valid', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'bold' }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          // @ts-expect-error type field
          marks: [{ type: 'bol' }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
