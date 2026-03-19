import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { TextNodeDto } from './text-node.dto'

describe('TextNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: TextNodeDto,
  }

  test('should success if node without marks is valid', async () => {
    const body: TextNodeDto = {
      type: 'text',
      text: 'Test',
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should success if node with marks is valid', async () => {
    const body: TextNodeDto = {
      type: 'text',
      marks: [{ type: 'bold' }],
      text: 'Test',
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not provided', async () => {
    // @ts-expect-error type field
    const body: TextNodeDto = {
      text: 'Test',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: TextNodeDto = {
      // @ts-expect-error type field
      type: 'tex',
      text: 'Test',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if marks field is empty', async () => {
    const body: TextNodeDto = {
      type: 'text',
      marks: [],
      text: 'Test',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if marks contains not allowed node', async () => {
    const body: TextNodeDto = {
      type: 'text',
      // @ts-expect-error type field
      marks: [{ type: 'not allowed' }],
      text: 'Test',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if text field not provided', async () => {
    // @ts-expect-error text field
    const body: TextNodeDto = {
      type: 'text',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if text field is empty', async () => {
    const body: TextNodeDto = {
      type: 'text',
      text: '',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if text field is not a string', async () => {
    const body: TextNodeDto = {
      type: 'text',
      // @ts-expect-error text field
      text: 1,
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
