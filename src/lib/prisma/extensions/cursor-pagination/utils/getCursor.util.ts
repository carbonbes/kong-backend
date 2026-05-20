export const getCursor = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64')
