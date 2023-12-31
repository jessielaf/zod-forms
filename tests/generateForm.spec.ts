import { describe, expect, test } from 'vitest'
import { z } from 'zod'
import { generateForm } from '../src/index.js' // Replace with your actual module name

describe('Generate form', () => {
	test('generateForm with simple schema', () => {
		const schema = z.object({
			field1: z.string(),
			field2: z.number(),
		})

		const result = generateForm(schema)
		expect(result).toEqual({
			field1: { type: 'text', zodType: schema._def.shape().field1 },
			field2: { type: 'number', zodType: schema._def.shape().field2 },
		})
	})

	test('generateForm with meta overrides', () => {
		const schema = z.object({
			field1: z.string(),
		})
		const meta = { field1: { someMeta: 'info' } }

		const result = generateForm(schema, meta)
		expect(result).toEqual({
			field1: { type: 'text', zodType: schema._def.shape().field1, meta: { someMeta: 'info' } },
		})
	})

	test('generateForm with refine', () => {
		const schema = z
			.object({
				field1: z.string(),
			})
			.refine(() => {})
		const result = generateForm(schema)
		expect(result).toEqual({
			field1: { type: 'text', zodType: schema.innerType()._def.shape().field1 },
		})
	})

	test('generateForm with transform', () => {
		const schema = z
			.object({
				field1: z.string(),
			})
			.transform(() => {})
		const result = generateForm(schema)
		expect(result).toEqual({
			field1: { type: 'text', zodType: schema.innerType()._def.shape().field1 },
		})
	})
})
