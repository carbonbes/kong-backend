import { objectToBase64, objectFromBase64 } from './'

describe('objectToBase64', () => {
  test('should get base64 from object', () => {
    const object = {
      a: 1,
      b: '',
      c: true,
      d: null,
      e: { a: 2, b: false },
      f: [1, 2],
      g: [],
    }
    const base64Object = objectToBase64(object)

    const result = objectToBase64(object)

    expect(result).toEqual(base64Object)
  })
})
