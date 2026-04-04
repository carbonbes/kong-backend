import { Column, Entity } from 'typeorm'
import { BaseEntity } from '@/shared/typeorm/entities'

@Entity('subsites')
export class Subsite extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string
}
