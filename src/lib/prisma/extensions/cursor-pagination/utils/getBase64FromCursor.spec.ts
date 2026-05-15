import { getBase64FromCursor, getCursorFromBase64 } from './'

describe('getBase64FromCursor', () => {
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
    const base64Object = getBase64FromCursor(object)

    const result = getCursorFromBase64(object)

    expect(result).toEqual(base64Object)
  })
})
