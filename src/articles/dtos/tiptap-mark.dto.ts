import { IsIn } from 'class-validator'

export const markTypes = ['bold', 'italic', 'link', 'blur', 'strike'] as const

export type MarkType = (typeof markTypes)[number]

export class MarkDto {
  @IsIn(markTypes)
  type: MarkType
}
