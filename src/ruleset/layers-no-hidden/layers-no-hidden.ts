import {
  Rule,
  RuleModule,
  VisitorData,
  ReportItem,
  RuleInvocationContext,
} from '../..'
import { ruleSet } from '../'

const id = 'layers-no-hidden'

const rule: Rule = async (context: RuleInvocationContext): Promise<void> => {
  const { utils } = context
  const invalid: VisitorData[] = []
  await utils.walk({
    allLayers(data): void {
      if ('isVisible' in data.node && data.node.isVisible === false) {
        invalid.push(data)
      }
    },
  })
  utils.report(
    invalid.map(
      (data): ReportItem => ({
        message: 'Unexpected hidden layer',
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
  title: 'No hidden layers',
  description: 'Enable this rule to disallow hidden layers from the document',
}

export { ruleModule }
