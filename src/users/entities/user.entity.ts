import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { UserGender, UserRole } from '@/users/enums'
import { CreateDateColumn, UpdateDateColumn } from '@/shared/typeorm/decorators'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

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

  @CreateDateColumn()
  createdAt: number

  @UpdateDateColumn()
  updatedAt: number
}
