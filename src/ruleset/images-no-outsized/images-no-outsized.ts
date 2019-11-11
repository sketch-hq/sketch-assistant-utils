import {
  Rule,
  RuleModule,
  RuleInvocationContext,
  FileFormat,
  VisitorData,
  ReportItem,
  JSONSchema,
} from '../..'
import { ruleSet } from '../'

const optionSchema: JSONSchema = {
  type: 'object',
  properties: {
    maxRatio: {
      type: 'number',
      minimum: 1,
    },
  },
  required: ['maxRatio'],
}

const id = 'images-no-outsized'

const rule: Rule = async (context: RuleInvocationContext): Promise<void> => {
  const { utils } = context
  const maxRatio = utils.getOption<number>('maxRatio') || Infinity
  const invalid: VisitorData[] = []
  await utils.walk({
    async [FileFormat.Class.bitmap](data): Promise<void> {
      if (
        'image' in data.node &&
        'frame' in data.node &&
        data.node.image &&
        data.node.frame
      ) {
        const { width, height } = await utils.getImageMetadata(
          data.node.image._ref,
        )
        const { frame } = data.node
        const isWidthOversized = frame.width * maxRatio < width
        const isHeightOversized = frame.height * maxRatio < height
        if (isWidthOversized || isHeightOversized) {
          invalid.push(data)
        }
      }
    },
  })
  utils.report(
    invalid.map(
      (data): ReportItem => ({
        message: `Unexpected x${maxRatio} oversized image`,
        ruleId: id,
        ruleSetId: ruleSet.id,
        data,
      }),
    ),
  )
}

const ruleModule: RuleModule = {
  rule,
  id,
  optionSchema,
  title: 'No outsized images',
  description:
    'Enable this rule to disallow images that are larger than their frame',
}

export { ruleModule }
