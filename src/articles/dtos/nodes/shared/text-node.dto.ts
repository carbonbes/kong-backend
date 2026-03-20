import { Type } from 'class-transformer'
import {
  ArrayNotEmpty,
  Equals,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { MARK_NODES } from '@/articles/consts'
import { BoldMarkDto } from '@/articles/dtos/marks/bold-mark.dto'
import { ItalicMarkDto } from '@/articles/dtos/marks/italic-mark.dto'
import { LinkMarkDto } from '@/articles/dtos/marks/link-mark.dto'
import { BlurMarkDto } from '@/articles/dtos/marks/blur-mark.dto'
import { StrikeMarkDto } from '@/articles/dtos/marks/strike-mark.dto'

type TextMarkNodes =
  | BoldMarkDto
  | ItalicMarkDto
  | LinkMarkDto
  | BlurMarkDto
  | StrikeMarkDto

class MarkDto {
  @IsIn(MARK_NODES)
  type: (typeof MARK_NODES)[number]
}

export class TextNodeDto {
  @Equals('text')
  type: 'text'

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MarkDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'bold', value: BoldMarkDto },
        { name: 'italic', value: ItalicMarkDto },
        { name: 'link', value: LinkMarkDto },
        { name: 'blur', value: BlurMarkDto },
        { name: 'strike', value: StrikeMarkDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  marks?: TextMarkNodes[]

  @IsString()
  @IsNotEmpty()
  text: string
}
