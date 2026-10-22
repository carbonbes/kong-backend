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

  test('should throw a BadRequestException if type field is not provided', async () => {
    // @ts-expect-error type field
    const body: HeadingNodeDto = {
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: HeadingNodeDto = {
      // @ts-expect-error type field
      type: 'headin',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if attrs field is not provided', async () => {
    // @ts-expect-error attrs field
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
      // @ts-expect-error attrs field
      attrs: {},
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if level attr field is not a number', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      // @ts-expect-error level field
      attrs: { level: '1' },
      content: [{ type: 'text', text: 'Test' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if level attr field is outside the allowed range', async () => {
    const body: HeadingNodeDto = {
      type: 'heading',
      // @ts-expect-error level field
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
      // @ts-expect-error type field
      content: [{ type: 'paragraph' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
