export const parseCursor = (value: string) =>
  JSON.parse(Buffer.from(value, 'base64').toString('utf-8'))
