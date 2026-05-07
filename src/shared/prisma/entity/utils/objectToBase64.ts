export const objectToBase64 = (value: object) =>
  Buffer.from(JSON.stringify(value)).toString('base64')
