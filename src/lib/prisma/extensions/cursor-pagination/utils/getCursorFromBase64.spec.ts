import { getBase64FromCursor, getCursorFromBase64 } from './'

describe('getCursorFromBase64', () => {
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
    const base64Object = getBase64FromCursor(object)

    const result = getCursorFromBase64(base64Object)

    expect(result).toEqual(object)
  })
})
