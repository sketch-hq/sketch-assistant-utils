import {
  Rule,
  Node,
  RuleModule,
  ReportItem,
  RuleInvocationContext,
  JSONSchema,
} from '../../types'

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
  const invalid: Node[] = []
  await utils.walk({
    $groups(node): void {
      if (
        'layers' in node &&
        node.layers &&
        typeof maxLayers === 'number' &&
        node.layers.length > maxLayers
      ) {
        invalid.push(node)
      }
    },
  })
  utils.report(
    invalid.map(
      (node): ReportItem => ({
        message: `Expected ${maxLayers} or less layers, found ${'layers' in
          node &&
          node.layers &&
          node.layers.length}`,
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
  title: 'Maximum layers in a group',
  description:
    'Enable this rule to restrict layers to a maximum number of groups',
}

export { ruleModule }
