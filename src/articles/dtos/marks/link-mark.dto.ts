import { Type } from 'class-transformer'
import {
  Equals,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'

class LinkMarkAttrs {
  @IsString()
  @IsNotEmpty()
  href: string

  @IsOptional()
  @IsString()
  target?: string

  @IsOptional()
  @IsString()
  rel?: string
}

export class LinkMarkDto {
  @Equals('link')
  type: 'link'

  @IsObject()
  @ValidateNested()
  @Type(() => LinkMarkAttrs)
  attrs: LinkMarkAttrs
}
