import { OTPGenerateOptions, OTPVerifyOptions } from 'otplib'

export interface OtpsModuleOptions
  extends Partial<OTPGenerateOptions>, Partial<OTPVerifyOptions> {}
