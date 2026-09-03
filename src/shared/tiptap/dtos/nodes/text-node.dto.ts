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
import {
  BoldMarkDto,
  ItalicMarkDto,
  LinkMarkDto,
  BlurMarkDto,
  StrikeMarkDto,
} from '../marks'

type TextMarkNodes =
  BoldMarkDto | ItalicMarkDto | LinkMarkDto | BlurMarkDto | StrikeMarkDto

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
