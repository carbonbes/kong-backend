import { Comment } from '@/comments/entities'
import { getFakeUser } from '@/test/utils/getFakeUser'
import { getFakeArticle } from '@/test/utils/getFakeArticle'
import { faker } from '@faker-js/faker/locale/ru'

type GetFakeCommentOptions = Partial<Comment>

export const getFakeComment = ({
  id,
  authorId,
  author,
  articleId,
  article,
  parentCommentId,
  content,
  rating,
  childrenCount,
  createdAt,
  updatedAt,
}: GetFakeCommentOptions = {}): Comment => ({
  id: id ?? faker.number.int(),
  authorId: authorId ?? faker.number.int(),
  author: author ?? getFakeUser(),
  articleId: articleId ?? faker.number.int(),
  article: article ?? getFakeArticle(),
  parentCommentId: parentCommentId ?? faker.number.int(),
  content: content ?? {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
  },
  rating: rating ?? faker.number.int(),
  childrenCount: childrenCount ?? faker.number.int(),
  createdAt: createdAt ?? faker.date.past().getTime(),
  updatedAt: updatedAt ?? faker.date.future().getTime(),
})
