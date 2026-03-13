import { describe, expect, test } from 'vitest'
import { getFakeTextNodes } from './getFakeTextNodes'

describe('getFakeTextNodes', () => {
  test('should be split text by single range', () => {
    const text = 'abcdef'
    const nodes = getFakeTextNodes({
      text,
      ranges: [{ type: 'bold', from: 1, to: 3 }],
    })

    expect(nodes.map((node) => node.text)).toEqual(['a', 'bc', 'def'])
    expect(nodes[0].marks).toBeUndefined()
    expect(nodes[1].marks?.map((mark) => mark.type)).toEqual(['bold'])
    expect(nodes[2].marks).toBeUndefined()
  })

  test('should be merge marks for overlapping ranges', () => {
    const text = 'abcdef'
    const nodes = getFakeTextNodes({
      text,
      ranges: [
        { type: 'bold', from: 1, to: 4 },
        { type: 'italic', from: 2, to: 5 },
      ],
    })

    expect(nodes.map((node) => node.text)).toEqual([
      'a',
      'b',
      'cd',
      'e',
      'f',
    ])
    expect(nodes[1].marks?.map((mark) => mark.type)).toEqual(['bold'])
    expect(nodes[2].marks?.map((mark) => mark.type)).toEqual(['bold', 'italic'])
    expect(nodes[3].marks?.map((mark) => mark.type)).toEqual(['italic'])
  })

  test('should be clamp out of bounds ranges', () => {
    const text = 'abcd'
    const nodes = getFakeTextNodes({
      text,
      ranges: [
        { type: 'bold', from: -2, to: 2 },
        { type: 'italic', from: 3, to: 10 },
        { type: 'blur', from: 5, to: 6 },
      ],
    })

    expect(nodes.map((node) => node.text)).toEqual(['ab', 'c', 'd'])
    expect(nodes[0].marks?.map((mark) => mark.type)).toEqual(['bold'])
    expect(nodes[1].marks).toBeUndefined()
    expect(nodes[2].marks?.map((mark) => mark.type)).toEqual(['italic'])
  })
})
