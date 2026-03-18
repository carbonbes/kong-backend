import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserGender, UserRole } from '@/users/enums'

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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole

  @Column({ type: 'boolean', default: false })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
