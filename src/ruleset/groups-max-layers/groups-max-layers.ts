import {
  Rule,
  Node,
  RuleModule,
  ReportItem,
  RuleInvocationContext,
} from '../../types'
import {
  buildRuleOptionSchema,
  numberOption,
} from '../../build-rule-option-schema'

const optionSchema = buildRuleOptionSchema(
  numberOption({
    name: 'maxLayers',
    title: 'Maximum layers',
    defaultValue: 50,
    description: 'Maximum layers in a group',
    minimum: 1,
  }),
)

const name = 'groups-max-layers'

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
        ruleName: name,
        node,
      }),
    ),
  )
}

const ruleModule: RuleModule = {
  rule,
  name,
  optionSchema,
  title: 'Maximum layers in a group',
  description:
    'Enable this rule to restrict layers to a maximum number of groups',
}

export { ruleModule }
