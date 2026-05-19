export const parseCursor = <T>(value: string): T =>
  JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
