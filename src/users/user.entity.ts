import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { UserGender } from './user.interface'

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  name: string

  @Column({ unique: true })
  email: string

  @Column({
    type: 'enum',
    enum: UserGender,
    default: UserGender.OTHER,
  })
  gender: UserGender

  @CreateDateColumn()
  createdAt: Date
}
