import { Comment } from '@/comments/types'
import { faker } from '@faker-js/faker/locale/ru'
import { JSONContent } from '@tiptap/core'

type FakeComment = Omit<Comment, 'content'> & { content: JSONContent }
type GetFakeCommentOptions = Partial<FakeComment>
type GetFakeCommentReturn = FakeComment

export const getFakeComment = ({
  id,
  authorId,
  articleId,
  parentCommentId,
  content,
  rating,
  createdAt,
  updatedAt,
}: GetFakeCommentOptions = {}): GetFakeCommentReturn => ({
  id: id ?? faker.number.int(),
  authorId: authorId ?? faker.number.int(),
  articleId: articleId ?? faker.number.int(),
  parentCommentId: parentCommentId ?? faker.number.int(),
  content: content ?? {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
  },
  rating: rating ?? faker.number.int(),
  createdAt: createdAt ?? faker.date.past(),
  updatedAt: updatedAt ?? faker.date.future(),
})
