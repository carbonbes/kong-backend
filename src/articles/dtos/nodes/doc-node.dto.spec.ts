import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { DocNodeDto } from './doc-node.dto'

describe('DocNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: DocNodeDto,
  }

  test('should success if node is valid', async () => {
    const body: DocNodeDto = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not provided', async () => {
    // @ts-expect-error type field
    const body: DocNodeDto = {
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is not provided', async () => {
    const body: DocNodeDto = {
      // @ts-expect-error type field
      type: 'do',
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
    const body: DocNodeDto = {
      type: 'doc',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is empty', async () => {
    const body: DocNodeDto = {
      type: 'doc',
      content: [],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field contains not allowed node', async () => {
    const body: DocNodeDto = {
      type: 'doc',
      // @ts-expect-error type field
      content: [{ type: 'text' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
