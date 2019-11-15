import { getOption } from './get-option'
import { Config } from '../types'

test('Returns null for a missing rule or option', (): void => {
  const config: Config = {
    rules: {
      baz: { active: true, qux: true },
    },
  }
  expect(getOption(config, 'foo', 'bar')).toMatchInlineSnapshot(`null`)
  expect(getOption(config, 'baz', 'typo')).toMatchInlineSnapshot(`null`)
})

test('Returns value from secondary options', (): void => {
  const config: Config = {
    rules: {
      foo: { active: true, bar: 12 },
      baz: { active: true, qux: true },
    },
  }
  expect(getOption(config, 'foo', 'bar')).toMatchInlineSnapshot(`12`)
  expect(getOption(config, 'baz', 'qux')).toMatchInlineSnapshot(`true`)
})

test('Handles a poorly formatted config', (): void => {
  const config: Config = {
    rules: {
      // eslint-disable-next-line
      // @ts-ignore
      foo: [true],
    },
  }
  expect(getOption(config, 'foo', 'bar')).toMatchInlineSnapshot(`null`)
})
