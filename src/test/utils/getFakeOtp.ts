import { Otp } from '@/otps/otps.types'
import { faker } from '@faker-js/faker/locale/ru'
import { OtpType } from '@/otps/otps.enums'
import { Uuid } from '@/shared/uuid/uuid.types'
import { getFakeInt } from '@/test/utils/getFakeInt'

type GetFakeOtpOptions = Partial<Otp>

const otpType: OtpType[] = [OtpType.SIGN_IN, OtpType.SIGN_UP]

export const getFakeOtp = ({
  id,
  code,
  type,
  userId,
}: GetFakeOtpOptions = {}): Otp => ({
  id: id ?? (faker.string.uuid() as Uuid),
  code: code ?? faker.string.alphanumeric({ length: 6 }),
  type: type ?? faker.helpers.arrayElement(otpType),
  userId: userId ?? getFakeInt(),
})
