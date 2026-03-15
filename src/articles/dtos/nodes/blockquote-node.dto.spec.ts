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

  test('should throw a BadRequestException if type field is invalid', async () => {
    // @ts-expect-error content field
    const body: BlockquoteNodeDto = {
      type: 'blockquot',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field not provided', async () => {
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
      // @ts-expect-error invalid node child
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
