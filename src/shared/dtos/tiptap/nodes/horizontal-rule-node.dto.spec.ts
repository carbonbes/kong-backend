import {
  ArgumentMetadata,
  BadRequestException,
  ValidationPipe,
} from '@nestjs/common'
import { HorizontalRuleNodeDto } from './horizontal-rule-node.dto'

describe('HorizontalRuleNodeDto', () => {
  const target = new ValidationPipe({ whitelist: true })
  const metadata: ArgumentMetadata = {
    type: 'body',
    metatype: HorizontalRuleNodeDto,
  }

  test('should success if node is valid', async () => {
    const body: HorizontalRuleNodeDto = {
      type: 'horizontalRule',
    }

    await expect(target.transform(body, metadata)).resolves.toBeTruthy()
  })

  test('should throw a BadRequestException if type field is not valid', async () => {
    const body: HorizontalRuleNodeDto = {
      // @ts-expect-error type field not valid
      type: 'horizontalRul',
    }

    await expect(target.transform(body, metadata)).rejects.toThrow(
      BadRequestException,
    )
  })
})
