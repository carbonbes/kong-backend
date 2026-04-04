import { Subsite } from '@/subsites/entities'
import { IsInt, IsNotEmpty, IsString, Length, Min } from 'class-validator'

export class SubsiteDto implements Omit<Subsite, 'beforeUpdateHandle'> {
  @IsInt()
  @Min(1)
  id: number

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  name: string

  @IsInt()
  @Min(0)
  createdAt: number

  @IsInt()
  @Min(0)
  updatedAt: number
}
