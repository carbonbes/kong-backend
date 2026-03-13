import { Type } from 'class-transformer'
import {
  Equals,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import {
  BlurMarkDto,
  BoldMarkDto,
  ItalicMarkDto,
  LinkMarkDto,
  StriketroughMarkDto,
} from '@/articles/dtos'
import { MARK_NODES } from '@/articles/consts'

class MarkDto {
  @IsIn(MARK_NODES)
  type: (typeof MARK_NODES)[number]
}

export class TextNodeDto {
  @Equals('text')
  type: 'text'

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MarkDto, {
    discriminator: {
      property: 'type',
      subTypes: [
        { name: 'bold', value: BoldMarkDto },
        { name: 'italic', value: ItalicMarkDto },
        { name: 'link', value: LinkMarkDto },
        { name: 'blur', value: BlurMarkDto },
        { name: 'strike', value: StriketroughMarkDto },
      ],
    },
    keepDiscriminatorProperty: true,
  })
  marks?: MarkDto[]

  @IsString()
  @IsNotEmpty()
  text: string
}
