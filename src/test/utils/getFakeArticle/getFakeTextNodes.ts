import { faker } from '@faker-js/faker/locale/ru'
import { MARK_NODES } from '@/articles/consts'
import type {
  BlurMarkDto,
  BoldMarkDto,
  ItalicMarkDto,
  LinkMarkDto,
  StriketroughMarkDto,
  TextNodeDto,
} from '@/articles/dtos'
import { getFakeBlurMark } from '@/test/utils/getFakeArticle/getFakeBlurMark'
import { getFakeBoldMark } from '@/test/utils/getFakeArticle/getFakeBoldMark'
import { getFakeItalicMark } from '@/test/utils/getFakeArticle/getFakeItalicMark'
import { getFakeLinkMark } from '@/test/utils/getFakeArticle/getFakeLinkMark'
import { getFakeStriketroughMark } from '@/test/utils/getFakeArticle/getFakeStriketroughMark'
import { getFakeTextNode } from '@/test/utils/getFakeArticle/getFakeTextNode'

type MarkType = (typeof MARK_NODES)[number]

type TextMark =
  | BlurMarkDto
  | BoldMarkDto
  | ItalicMarkDto
  | LinkMarkDto
  | StriketroughMarkDto

type LinkMarkAttrs = Partial<LinkMarkDto['attrs']>

export type MarkRange =
  | {
      type: 'link'
      from: number
      to: number
      attrs?: LinkMarkAttrs
    }
  | {
      type: Exclude<MarkType, 'link'>
      from: number
      to: number
    }

type GetFakeTextNodesOptions = {
  text?: string
  ranges?: MarkRange[]
}

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const buildMark = (range: MarkRange): TextMark => {
  switch (range.type) {
    case 'bold':
      return getFakeBoldMark()
    case 'italic':
      return getFakeItalicMark()
    case 'blur':
      return getFakeBlurMark()
    case 'strike':
      return getFakeStriketroughMark()
    case 'link':
      return getFakeLinkMark(range.attrs)
  }
}

export const getFakeTextNodes = (
  options: GetFakeTextNodesOptions = {},
): TextNodeDto[] => {
  const text = options.text ?? faker.lorem.paragraph()

  if (text.length === 0) {
    return []
  }

  const ranges = (options.ranges ?? [])
    .map((range) => {
      const from = clamp(range.from, 0, text.length)
      const to = clamp(range.to, 0, text.length)

      return {
        ...range,
        from,
        to,
      }
    })
    .filter((range) => range.from < range.to)

  const boundaries = new Set<number>([0, text.length])

  for (const range of ranges) {
    boundaries.add(range.from)
    boundaries.add(range.to)
  }

  const sortedBoundaries = Array.from(boundaries).sort((a, b) => a - b)

  const nodes: TextNodeDto[] = []

  for (let index = 0; index < sortedBoundaries.length - 1; index += 1) {
    const from = sortedBoundaries[index]
    const to = sortedBoundaries[index + 1]

    if (from === to) {
      continue
    }

    const segmentText = text.slice(from, to)

    if (!segmentText) {
      continue
    }

    const marksByType = new Map<MarkType, TextMark>()

    for (const range of ranges) {
      if (range.from <= from && range.to >= to) {
        marksByType.set(range.type, buildMark(range))
      }
    }

    const marks = MARK_NODES.reduce<TextMark[]>((result, type) => {
      const mark = marksByType.get(type)

      if (mark) {
        result.push(mark)
      }

      return result
    }, [])

    nodes.push(
      getFakeTextNode({
        text: segmentText,
        marks: marks.length > 0 ? marks : undefined,
      }),
    )
  }

  return nodes
}
