import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { generateForm } from '../src/index.js' // Replace with your actual module name

describe('generate form', () => {
  it('generateForm with simple schema', () => {
    const schema = z.object({
      field1: z.string(),
      field2: z.number(),
    })

    const result = generateForm(schema)
    expect(result).toEqual({
      field1: {
        accessor: 'field1',
        type: 'string',
        input: 'input',
        validator: schema._def.shape().field1,
      },
      field2: {
        accessor: 'field2',
        type: 'number',
        input: 'input',
        validator: schema._def.shape().field2,
      },
    })
  })

  it('generateForm with meta overrides', () => {
    const schema = z.object({
      field1: z.string(),
      field2: z.string(),
    })
    const meta = { field1: { someMeta: 'info' } }

    const result = generateForm(schema, meta)
    expect(result).toEqual({
      field1: {
        accessor: 'field1',
        type: 'string',
        input: 'input',
        validator: schema._def.shape().field1,
        someMeta: 'info',
      },
      field2: {
        accessor: 'field2',
        type: 'string',
        input: 'input',
        validator: schema._def.shape().field2,
      },
    })
  })

  it('generateForm with refine', () => {
    const schema = z
      .object({
        field1: z.string(),
      })
      .refine(() => {})
    const result = generateForm(schema)
    expect(result).toEqual({
      field1: {
        accessor: 'field1',
        type: 'string',
        input: 'input',
        validator: schema.innerType()._def.shape().field1,
      },
    })
  })

  it('generateForm with transform', () => {
    const schema = z
      .object({
        field1: z.string(),
      })
      .transform(() => {})
    const result = generateForm(schema)
    expect(result).toEqual({
      field1: {
        accessor: 'field1',
        type: 'string',
        input: 'input',
        validator: schema.innerType()._def.shape().field1,
      },
    })
  })
})
