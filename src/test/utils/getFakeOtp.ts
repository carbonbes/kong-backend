import { Otp } from '@/otps/types'
import { faker } from '@faker-js/faker/locale/ru'
import { OtpType } from '@/otps/enums'

type GetFakeOtpOptions = Partial<Otp>

const otpType: OtpType[] = [OtpType.SIGN_IN, OtpType.SIGN_UP]

export const getFakeOtp = ({
  code,
  type,
  email,
}: GetFakeOtpOptions = {}): Otp => ({
  code: code ?? faker.string.alphanumeric({ length: 6, casing: 'upper' }),
  type: type ?? faker.helpers.arrayElement(otpType),
  email: email ?? faker.internet.email(),
})
