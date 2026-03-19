import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { ListItemNodeDto } from './list-item-node.dto'

describe('ListItemNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: ListItemNodeDto,
  }

  test('should success if node is valid', async () => {
    const body: ListItemNodeDto = {
      type: 'listItem',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not provided', async () => {
    // @ts-expect-error type field
    const body: ListItemNodeDto = {
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: ListItemNodeDto = {
      // @ts-expect-error type field
      type: 'listIte',
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
    const body: ListItemNodeDto = {
      type: 'listItem',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is empty', async () => {
    const body: ListItemNodeDto = {
      type: 'listItem',
      content: [],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field contains not allowed node', async () => {
    const body: ListItemNodeDto = {
      type: 'listItem',
      // @ts-expect-error type field
      content: [{ type: 'text' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
