import { IsIn } from 'class-validator'
import {
  InlineNodeType,
  inlineNodeTypes,
} from '@/articles/dtos/tiptap-node.dto'

export class InlineNodeDto {
  @IsIn(inlineNodeTypes)
  type: InlineNodeType
}
