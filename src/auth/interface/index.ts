import { User } from '../../users/entity'

export type SignUpInput = Pick<User, 'email' | 'name' | 'gender'>
