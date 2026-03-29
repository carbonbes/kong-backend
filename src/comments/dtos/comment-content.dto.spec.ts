import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { CommentContentDto } from './comment-content.dto'
import {
  getFakeBlockquoteNode,
  getFakeBulletListNode,
  getFakeHeadingNode,
  getFakeHorizontalRuleNode,
  getFakeListItemNode,
  getFakeOrderedListNode,
  getFakeParagraphNode,
  getFakeTextNode,
} from '@/test/utils'

describe('CommentContentDto', () => {
  const validationPipe = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: CommentContentDto,
  }

  test('should success if node is valid', async () => {
    const body1: CommentContentDto = {
      type: 'doc',
      content: [getFakeParagraphNode()],
    }

    const body2: CommentContentDto = {
      type: 'doc',
      content: [getFakeBlockquoteNode()],
    }

    const result1 = await validationPipe.transform(body1, metadata)
    const result2 = await validationPipe.transform(body2, metadata)

    expect(result1).toEqual(body1)
    expect(result2).toEqual(body2)
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: CommentContentDto = {
      // @ts-expect-error type field
      type: 'do',
      content: [getFakeParagraphNode()],
    }

    await expect(validationPipe.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is not provided', async () => {
    // @ts-expect-error content field
    const body: CommentContentDto = {
      type: 'doc',
    }

    await expect(validationPipe.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  test('should throw a BadRequestException if content field is empty', async () => {
    const body: CommentContentDto = {
      type: 'doc',
      content: [],
    }

    await expect(validationPipe.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })

  describe('should throw a BadRequestException if content field contains not allowed node', () => {
    test.for([
      [{ type: 'doc', content: [getFakeBulletListNode()] }, 'bulletList'],
      [{ type: 'doc', content: [getFakeHeadingNode()] }, 'heading'],
      [
        { type: 'doc', content: [getFakeHorizontalRuleNode()] },
        'horizontalRule',
      ],
      [{ type: 'doc', content: [getFakeOrderedListNode()] }, 'orderedList'],
      [{ type: 'doc', content: [getFakeListItemNode()] }, 'listItem'],
      [{ type: 'doc', content: [getFakeTextNode()] }, 'text'],
    ])(
      '$1',
      async ([a]) =>
        await expect(validationPipe.transform(a, metadata)).rejects.toThrow(
          BadRequestException,
        ),
    )
  })
})
