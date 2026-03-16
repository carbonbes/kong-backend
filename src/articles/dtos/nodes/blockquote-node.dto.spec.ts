import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { BlockquoteNodeDto } from './blockquote-node.dto'

describe('BlockquoteNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: BlockquoteNodeDto,
  }

  test('should success if node is valid', async () => {
    const body: BlockquoteNodeDto = {
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not provided', async () => {
    // @ts-expect-error type field
    const body: BlockquoteNodeDto = {
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is invalid', async () => {
    const body: BlockquoteNodeDto = {
      // @ts-expect-error type field
      type: 'blockquot',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is not provided', async () => {
    // @ts-expect-error content field
    const body: BlockquoteNodeDto = {
      type: 'blockquote',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is empty', async () => {
    const body: BlockquoteNodeDto = {
      type: 'blockquote',
      content: [],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content contains not allowed node', async () => {
    const body: BlockquoteNodeDto = {
      type: 'blockquote',
      // @ts-expect-error type field
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
