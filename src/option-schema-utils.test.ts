import { buildRuleOptionSchema, helpers } from './option-schema-utils'

const {
  numberOption,
  integerOption,
  stringOption,
  booleanOption,
  stringEnumOption,
  stringArrayOption,
  objectArrayOption,
} = helpers

test('Builds number option schemas', (): void => {
  expect(
    numberOption({
      name: 'myOption',
      title: 'My Option',
      description: 'A number option',
      defaultValue: 10,
      minimum: 0,
      maximum: 100,
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "default": 10,
        "description": "A number option",
        "maximum": 100,
        "minimum": 0,
        "title": "My Option",
        "type": "number",
      },
    }
  `)
})

test('Builds integer option schemas', (): void => {
  expect(
    integerOption({
      name: 'myOption',
      title: 'My Option',
      description: 'An integer option',
      defaultValue: 10,
      minimum: 0,
      maximum: 100,
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "default": 10,
        "description": "An integer option",
        "maximum": 100,
        "minimum": 0,
        "title": "My Option",
        "type": "integer",
      },
    }
  `)
})

test('Builds string option schemas', (): void => {
  expect(
    stringOption({
      name: 'myOption',
      title: 'My Option',
      description: 'A string option',
      defaultValue: 'foo',
      minLength: 0,
      maxLength: 100,
      pattern: '^.*$',
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "default": "foo",
        "description": "A string option",
        "maxLength": 100,
        "minLength": 0,
        "pattern": "^.*$",
        "title": "My Option",
        "type": "string",
      },
    }
  `)
})

test('Builds a boolean option schemas', (): void => {
  expect(
    booleanOption({
      name: 'myOption',
      title: 'My Option',
      description: 'A boolean option',
      defaultValue: true,
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "default": true,
        "description": "A boolean option",
        "title": "My Option",
        "type": "boolean",
      },
    }
  `)
})

test('Builds a string enum option schemas', (): void => {
  expect(
    stringEnumOption({
      name: 'myOption',
      title: 'My Option',
      description: 'A string option',
      defaultValue: 'foo',
      values: ['foo', 'bar'],
      valueTitles: ['The foo option', 'The bar option'],
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "default": "foo",
        "description": "A string option",
        "enum": Array [
          "foo",
          "bar",
        ],
        "enumDescriptions": Array [
          "The foo option",
          "The bar option",
        ],
        "title": "My Option",
        "type": "string",
      },
    }
  `)
})

test('Builds a string array option schemas', (): void => {
  expect(
    stringArrayOption({
      name: 'myOption',
      title: 'My Option',
      description: 'A string array option',
      defaultValue: ['foo'],
      maxLength: 100,
      minLength: 0,
      pattern: '^.*$',
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "default": Array [
          "foo",
        ],
        "description": "A string array option",
        "items": Object {
          "maxLength": 100,
          "minLength": 0,
          "pattern": "^.*$",
          "type": "string",
        },
        "title": "My Option",
        "type": "array",
      },
    }
  `)
})

test('Builds a object array option schemas', (): void => {
  expect(
    objectArrayOption({
      name: 'myOption',
      title: 'My Option',
      description: 'An object array option',
      maxLength: 100,
      minLength: 0,
      props: [
        stringOption({
          name: 'foo',
          title: 'Foo',
          description: 'Foo',
        }),
        numberOption({
          name: 'bar',
          title: 'Bar',
          description: 'Bar',
        }),
      ],
    }),
  ).toMatchInlineSnapshot(`
    Object {
      "myOption": Object {
        "description": "An object array option",
        "items": Object {
          "maxLength": 100,
          "minLength": 0,
          "properties": Object {
            "bar": Object {
              "default": 0,
              "description": "Bar",
              "title": "Bar",
              "type": "number",
            },
            "foo": Object {
              "default": "",
              "description": "Foo",
              "title": "Foo",
              "type": "string",
            },
          },
          "type": "object",
        },
        "title": "My Option",
        "type": "array",
      },
    }
  `)
})

test('Can handle multiple options', (): void => {
  expect(
    buildRuleOptionSchema([
      numberOption({
        name: 'myNumberOption',
        title: 'My Number Option',
        description: 'A number option',
      }),
      stringOption({
        name: 'myStringOption',
        title: 'My String Option',
        description: 'A string option',
      }),
    ]),
  ).toMatchInlineSnapshot(`
    Object {
      "properties": Object {
        "myNumberOption": Object {
          "default": 0,
          "description": "A number option",
          "title": "My Number Option",
          "type": "number",
        },
        "myStringOption": Object {
          "default": "",
          "description": "A string option",
          "title": "My String Option",
          "type": "string",
        },
      },
      "required": Array [
        "myNumberOption",
        "myStringOption",
      ],
      "type": "object",
    }
  `)
})
