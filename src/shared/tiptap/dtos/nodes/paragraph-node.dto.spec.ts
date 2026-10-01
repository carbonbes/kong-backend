import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { ParagraphNodeDto } from './paragraph-node.dto'

describe('ParagraphNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: ParagraphNodeDto,
  }

  test('should success if node is valid', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not provide', async () => {
    // @ts-expect-error type field
    const body: ParagraphNodeDto = {
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: ParagraphNodeDto = {
      // @ts-expect-error type field
      type: 'paragrap',
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field contains not allowed node', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      // @ts-expect-error type field
      content: [{ type: 'heading' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
