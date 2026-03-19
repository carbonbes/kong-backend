import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { OrderedListNodeDto } from './ordered-list-node.dto'

describe('OrderedListNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: OrderedListNodeDto,
  }

  test('should success if node without attrs field is valid', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should success if node with attrs field is valid', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not provided', async () => {
    // @ts-expect-error type field
    const body: OrderedListNodeDto = {
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: OrderedListNodeDto = {
      // @ts-expect-error type field
      type: 'orderedLis',
      attrs: { start: 1 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if attrs field is empty', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      attrs: {},
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if start attrs field is not number', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      // @ts-expect-error start field
      attrs: { start: '1' },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if start attr field starts not a 1', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      attrs: { start: 0 },
      content: [
        {
          type: 'listItem',
          content: [
            { type: 'paragraph', content: [{ type: 'text', text: 'Test' }] },
          ],
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is not provided', async () => {
    // @ts-expect-error content field
    const body: OrderedListNodeDto = {
      type: 'orderedList',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is empty', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      content: [],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field contains not allowed node', async () => {
    const body: OrderedListNodeDto = {
      type: 'orderedList',
      // @ts-expect-error type field
      content: [{ type: 'paragraph' }],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
