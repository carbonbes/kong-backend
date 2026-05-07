import { objectToBase64, objectFromBase64 } from './'

describe('objectFromBase64', () => {
  test('should get object from base64', () => {
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

    console.log(base64Object)

    const result = objectFromBase64(base64Object)

    expect(result).toEqual(object)
  })
})
