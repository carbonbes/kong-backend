import { Otp } from '@/otps/otps.types'
import { faker } from '@faker-js/faker/locale/ru'
import { OtpType } from '@/otps/otps.enums'
import { Uuid } from '@/shared/types/uuid.type'

const otpType: OtpType[] = [OtpType.SIGN_IN, OtpType.SIGN_UP]

export const createFakeOtp = ({
  id,
  code,
  type,
  userId,
}: Partial<Otp> = {}): Otp => ({
  id: id ?? (faker.string.uuid() as Uuid),
  code: code ?? faker.string.alphanumeric({ length: 6 }),
  type: type ?? faker.helpers.arrayElement(otpType),
  userId: userId ?? faker.number.int(),
})
