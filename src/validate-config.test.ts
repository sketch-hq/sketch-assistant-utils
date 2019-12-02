import { validateConfig } from './validate-config'
import { createDummyConfig } from './test-helpers'

test('Validates a basic config', async (): Promise<void> => {
  expect.assertions(1)
  await expect(validateConfig(createDummyConfig())).resolves.toBeTruthy()
})

test('Errors with invalid configs', async (): Promise<void> => {
  expect.assertions(3)

  // eslint-disable-next-line
  // @ts-ignore
  await expect(validateConfig({ name: 'foo', title: 'foo' })).rejects
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "dataPath": "",
        "keyword": "required",
        "message": "should have required property 'sketchLint'",
        "params": Object {
          "missingProperty": "sketchLint",
        },
        "schemaPath": "#/required",
      },
    ]
  `)

  await expect(
    // eslint-disable-next-line
    // @ts-ignore
    validateConfig({ name: 'foo', title: 'foo', sketchLint: {} }),
  ).rejects.toMatchInlineSnapshot(`
    Array [
      Object {
        "dataPath": ".sketchLint",
        "keyword": "required",
        "message": "should have required property 'rules'",
        "params": Object {
          "missingProperty": "rules",
        },
        "schemaPath": "#/properties/sketchLint/required",
      },
    ]
  `)

  await expect(
    validateConfig({
      name: 'foo',
      title: 'foo',
      // eslint-disable-next-line
      // @ts-ignore
      dependencies: { foo: 1 },
      sketchLint: { rules: {} },
    }),
  ).rejects.toMatchInlineSnapshot(`
    Array [
      Object {
        "dataPath": ".dependencies['foo']",
        "keyword": "type",
        "message": "should be string",
        "params": Object {
          "type": "string",
        },
        "schemaPath": "#/properties/dependencies/additionalProperties/type",
      },
    ]
  `)
})
