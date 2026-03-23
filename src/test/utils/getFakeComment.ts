import { Comment } from '@/comments/entities'
import { getFakeInt } from '@/test/utils/getFakeInt'
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
  createdAt,
  updatedAt,
}: GetFakeCommentOptions = {}): Comment => ({
  id: id ?? getFakeInt(),
  authorId: authorId ?? getFakeInt(),
  author: author ?? getFakeUser(),
  articleId: articleId ?? getFakeInt(),
  article: article ?? getFakeArticle(),
  parentCommentId: parentCommentId ?? getFakeInt(),
  content: content ?? {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Test' }] }],
  },
  createdAt: createdAt ?? faker.date.past(),
  updatedAt: updatedAt ?? faker.date.future(),
})
