import { Subsite } from '@/subsites/types'
import { IsDate, IsInt, IsNotEmpty, IsString, Min } from 'class-validator'

export class SubsiteDto implements Subsite {
  @IsInt()
  @Min(1)
  id: number

  @IsString()
  @IsNotEmpty()
  name: string

  @IsDate()
  createdAt: Date

  @IsDate()
  updatedAt: Date
}
