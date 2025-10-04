import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UserGender } from './user.enum'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column({ unique: true })
  email: string

  @Column()
  name: string

  @Column({ type: 'enum', enum: UserGender })
  gender: UserGender

  @Column({ default: false })
  isActive: boolean

  @CreateDateColumn()
  createdAt: Date
}
