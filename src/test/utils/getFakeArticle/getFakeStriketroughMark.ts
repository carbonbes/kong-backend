import type { StrikeMarkDto } from '@/articles/dtos'

export const getFakeStriketroughMark = (): StrikeMarkDto => ({
  type: 'strike',
})
