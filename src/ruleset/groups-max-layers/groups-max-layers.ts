import {
  Rule,
  VisitorData,
  RuleModule,
  ReportItem,
  RuleInvocationContext,
  JSONSchema,
} from '../..'
import { ruleSet } from '../'

const optionSchema: JSONSchema = {
  type: 'object',
  properties: {
    maxLayers: {
      type: 'number',
      minimum: 1,
    },
  },
  required: ['maxLayers'],
}

const id = 'groups-max-layers'

const rule: Rule = async (context: RuleInvocationContext): Promise<void> => {
  const { utils } = context
  const maxLayers = utils.getOption<number>('maxLayers')
  const invalid: VisitorData[] = []
  await utils.walk({
    allGroups(data): void {
      if (
        'layers' in data.node &&
        data.node.layers &&
        typeof maxLayers === 'number' &&
        data.node.layers.length > maxLayers
      ) {
        invalid.push(data)
      }
    },
  })
  utils.report(
    invalid.map(
      (data): ReportItem => ({
        message: `Expected ${maxLayers} or less layers, found ${'layers' in
          data.node &&
          data.node.layers &&
          data.node.layers.length}`,
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
  title: 'Maximum layers in a group',
  description:
    'Enable this rule to restrict layers to a maximum number of groups',
}

export { ruleModule }
