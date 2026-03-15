import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { HeadingNodeDto } from './heading-node.dto'

describe('HeadingNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: HeadingNodeDto,
  }

  test('should success if node is valid', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: HeadingNodeDto = {
      // @ts-expect-error type not valid
      type: 'headin',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if attrs field not provided', async () => {
    // @ts-expect-error attrs field not provided
    const body: HeadingNodeDto = {
      type: 'heading',
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if attrs field is empty', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      // @ts-expect-error empty attrs field
      attrs: {},
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if level attr field is not valid', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      // @ts-expect-error not valid level field
      attrs: { level: 0 },
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is empty', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      attrs: { level: 1 },
      content: [],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content contains not allowed node', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      attrs: { level: 1 },
      // @ts-expect-error type field in not valid
      content: [{ type: 'paragraph' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
