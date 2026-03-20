import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { ParagraphNodeDto } from '@/articles/dtos/nodes/paragraph-node.dto'

describe('BlurMarkDto', () => {
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
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if attrs field is not provided', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          // @ts-expect-error attrs field
          marks: [{ type: 'link' }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if attrs field is empty', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          // @ts-expect-error attrs field
          marks: [{ type: 'link', attrs: {} }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if href field is empty', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: '' } }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if href field contains a not valid protocol', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [{ type: 'link', attrs: { href: 'http://example.com' } }],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if target field is empty', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              // @ts-expect-error target field
              attrs: { href: 'https://example.com', target: '' },
            },
          ],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if target field is not valid', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              // @ts-expect-error target field
              attrs: { href: 'https://example.com', target: '_parent' },
            },
          ],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if rel field is empty', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              // @ts-expect-error rel field
              attrs: { href: 'https://example.com', rel: '' },
            },
          ],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if rel field is not valid', async () => {
    const body: ParagraphNodeDto = {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          marks: [
            {
              type: 'link',
              attrs: {
                href: 'https://example.com',
                // @ts-expect-error rel field
                rel: 'noopener noreferrer',
              },
            },
          ],
          text: 'Test',
        },
      ],
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
