import { createAssistantDefinition, createRule, createAssistant } from '../../test-helpers'
import { AssistantEnv, AssistantDefinition } from '../../types'
import { prepare, assign } from '../'

describe('assign', () => {
  test('names are merged right to left', () => {
    expect(
      assign(
        createAssistantDefinition({
          name: 'foo',
        }),
        createAssistantDefinition({
          name: 'bar',
        }),
      ).name,
    ).toMatchInlineSnapshot(`"bar"`)
  })

  test('descriptions are merged right to left', () => {
    expect(
      assign(
        createAssistantDefinition({
          description: 'foo',
        }),
        createAssistantDefinition({
          description: 'bar',
        }),
      ).description,
    ).toMatchInlineSnapshot(`"bar"`)
  })

  test('titles are merged right to left', () => {
    expect(
      assign(
        createAssistantDefinition({
          title: 'foo',
        }),
        createAssistantDefinition({
          title: 'bar',
        }),
      ).title,
    ).toMatchInlineSnapshot(`"bar"`)
  })

  test('do not overwrite with values that are the empty string', () => {
    expect(
      assign(
        createAssistantDefinition({
          title: 'foo',
          name: 'bar',
          description: 'baz',
        }),
        createAssistantDefinition({
          title: '',
          name: '',
          description: '',
        }),
      ),
    ).toMatchInlineSnapshot(`
      Object {
        "config": Object {
          "rules": Object {},
        },
        "description": "baz",
        "name": "bar",
        "rules": Array [],
        "title": "foo",
      }
    `)
  })

  test('config is merged right to left', () => {
    expect(
      assign(
        createAssistantDefinition({
          config: {
            rules: {
              foo: { active: true },
            },
          },
        }),
        createAssistantDefinition({
          config: {
            rules: {
              foo: { active: false },
              bar: { active: true },
            },
          },
        }),
      ).config,
    ).toMatchInlineSnapshot(`
      Object {
        "rules": Object {
          "bar": Object {
            "active": true,
          },
          "foo": Object {
            "active": false,
          },
        },
      }
    `)
  })

  test('rules are concatenated', () => {
    expect(
      assign(
        createAssistantDefinition({
          rules: [createRule({ name: 'foo' })],
        }),
        createAssistantDefinition({
          rules: [createRule({ name: 'bar' })],
        }),
      ).rules.map(rule => rule.name),
    ).toMatchInlineSnapshot(`
      Array [
        "foo",
        "bar",
      ]
    `)
  })
})

describe('prepare', () => {
  const env: AssistantEnv = {
    locale: 'en',
    platform: 'sketch',
  }

  test('prepares a single assistant function', async () => {
    const assistant: AssistantDefinition = await prepare(createAssistant(), env)
    expect(assistant.name).toMatchInlineSnapshot(`"dummy-assistant"`)
  })

  test('prepares and merges multiple assistant functions', async () => {
    const assistant: AssistantDefinition = await prepare(
      [
        createAssistant({ rules: [createRule({ name: 'foo' })] }),
        createAssistant({ rules: [createRule({ name: 'bar' })] }),
      ],
      env,
    )
    expect(assistant.rules.map(rule => rule.name)).toMatchInlineSnapshot(`
      Array [
        "foo",
        "bar",
      ]
    `)
  })

  test('prepares and merges nested assistant functions', async () => {
    const assistant: AssistantDefinition = await prepare(
      [
        createAssistant({ rules: [createRule({ name: 'foo' })] }),
        [
          createAssistant({ rules: [createRule({ name: 'bar' })] }),
          createAssistant({ rules: [createRule({ name: 'baz' })] }),
        ],
        createAssistant({ rules: [createRule({ name: 'qux' })] }),
      ],
      env,
    )
    expect(assistant.rules.map(rule => rule.name)).toMatchInlineSnapshot(`
      Array [
        "foo",
        "bar",
        "baz",
        "qux",
      ]
    `)
  })

  test('assistants can init lazily and do work during preparation', async () => {
    const assistant: AssistantDefinition = await prepare(async () => {
      const def = createAssistantDefinition()
      def.name = 'bar'
      return def
    }, env)
    expect(assistant.name).toMatchInlineSnapshot(`"bar"`)
  })
})
