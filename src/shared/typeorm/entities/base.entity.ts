import {
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ValueTransformer,
} from 'typeorm'

const transformer: ValueTransformer = {
  from: (value: string) => Number(value),
  to: (value: number | undefined) => value?.toString(),
}

@Entity()
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: 'bigint',
    default: () => 'extract(epoch from now())::bigint',
    transformer,
  })
  createdAt: number

  @Column({
    type: 'bigint',
    default: () => 'extract(epoch from now())::bigint',
    transformer,
  })
  updatedAt: number

  @BeforeUpdate()
  beforeUpdateHandle() {
    this.updatedAt = Math.floor(Date.now() / 1000)
  }
}
