import { Column, Entity } from 'typeorm'
import { UserGender, UserRole } from '@/users/enums'
import { BaseEntity } from '@/shared/typeorm/entities'

@Entity()
export class User extends BaseEntity {
  @Column({ unique: true, type: 'varchar', length: 100 })
  email: string

  @Column({ type: 'varchar', length: 100 })
  name: string

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender

  @Column({ type: 'enum', enum: UserRole, default: UserRole.User })
  role: UserRole

  @Column({ type: 'boolean', default: false })
  isActive: boolean
}
