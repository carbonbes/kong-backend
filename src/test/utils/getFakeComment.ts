import { Comment } from '@/comments/types'
import { faker } from '@faker-js/faker/locale/ru'

type GetFakeCommentOptions = Partial<Comment>

export const getFakeComment = ({
  id,
  authorId,
  articleId,
  parentCommentId,
  content,
  rating,
  createdAt,
  updatedAt,
}: GetFakeCommentOptions = {}): Comment => ({
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
