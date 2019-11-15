import { Rule, RuleModule } from '../../types'

const id = 'debug-throws-error'

const rule: Rule = (): void => {
  throw new Error('Test error message')
}

const ruleModule: RuleModule = {
  rule,
  id,
  title: 'Throw error',
  description: 'Enable this rule to trigger an error',
  debug: true,
}

export { ruleModule }
