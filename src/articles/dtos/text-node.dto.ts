import { Type } from 'class-transformer'
import {
  Equals,
  IsArray,
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
  MarkDto,
} from '@/articles/dtos'

export class TextNodeDto {
  @Equals('text')
  type: 'text'

  @IsString()
  text: string

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
}
