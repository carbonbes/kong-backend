export const getBase64FromCursor = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64')
