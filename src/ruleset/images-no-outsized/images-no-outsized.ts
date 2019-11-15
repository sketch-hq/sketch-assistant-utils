import {
  Rule,
  RuleModule,
  RuleInvocationContext,
  Node,
  ReportItem,
  JSONSchema,
} from '../../types'

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
  const invalid: Node[] = []
  await utils.walk({
    async bitmap(node): Promise<void> {
      if ('image' in node && 'frame' in node && node.image && node.frame) {
        const { width, height } = await utils.getImageMetadata(node.image._ref)
        const { frame } = node
        const isWidthOversized = frame.width * maxRatio < width
        const isHeightOversized = frame.height * maxRatio < height
        if (isWidthOversized || isHeightOversized) {
          invalid.push(node)
        }
      }
    },
  })
  utils.report(
    invalid.map(
      (node): ReportItem => ({
        message: `Unexpected x${maxRatio} oversized image`,
        ruleId: id,
        node,
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
