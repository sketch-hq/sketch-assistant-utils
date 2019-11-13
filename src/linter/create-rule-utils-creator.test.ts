import { createRuleUtilsCreator, LintViolation, getImageMetadata } from '..'

test('Reports violations by pushing to the passed in array', (): void => {
  const violations: LintViolation[] = []
  const createRuleUtils = createRuleUtilsCreator(
    { allGroups: [], allLayers: [] },
    violations,
    {
      rules: {},
    },
    { cancelled: false },
    // eslint-disable-next-line
    // @ts-ignore (file format schema issue)
    { filepath: '', data: { user: {}, meta: {}, document: { pages: [] } } },
    getImageMetadata,
  )
  const utils = createRuleUtils({
    id: 'foo',
    title: 'Foo',
    description: 'A foo rule',
    rule: async (): Promise<void> => {},
  })
  utils.report([
    {
      message: 'Violation',
      ruleId: 'foo',
      ruleSetId: 'foo',
      path: 'pages[0]',
    },
  ])
  expect(violations).toMatchInlineSnapshot(`
    Array [
      Object {
        "context": Object {
          "path": "pages[0]",
        },
        "message": "Violation",
        "ruleId": "foo",
        "ruleSetId": "foo",
        "severity": 3,
      },
    ]
  `)
})
