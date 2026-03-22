import { Type } from 'class-transformer'
import {
  Equals,
  IsIn,
  IsObject,
  IsOptional,
  IsUrl,
  ValidateNested,
} from 'class-validator'

class LinkMarkAttrsDto {
  @IsUrl({ require_protocol: true, protocols: ['https'] })
  href: string

  @IsOptional()
  @IsIn(['_self', '_blank'])
  target?: '_self' | '_blank'

  @IsOptional()
  @Equals('noopener noreferrer nofollow')
  rel?: 'noopener noreferrer nofollow'
}

export class LinkMarkDto {
  @Equals('link')
  type: 'link'

  @IsObject()
  @ValidateNested()
  @Type(() => LinkMarkAttrsDto)
  attrs: LinkMarkAttrsDto
}
