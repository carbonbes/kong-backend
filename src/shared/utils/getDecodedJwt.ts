import { EncodedJwt, JwtPayload } from '@/shared/types/jwt.type'

export const getDecodedJwt = (encodedJwt: EncodedJwt): JwtPayload => {
  const base64Payload = encodedJwt.split('.')[1]
  const payloadBuffer = Buffer.from(base64Payload, 'base64')

  return JSON.parse(payloadBuffer.toString())
}
