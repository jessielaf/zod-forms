import { expect, test, describe } from 'vitest'
import { z } from 'zod'
import { generateFormField } from '../src/index.js' // Replace with your actual module name

describe('Test getFormField', () => {
	test('generateFormField handles ZodBoolean', () => {
		const zodType = z.boolean()
		const formField = generateFormField({ validator: zodType })
		expect(formField).toEqual({
			type: 'boolean',
			input: 'boolean',
			validator: zodType,
		})
	})

	test('generateForm handles zod optional types with defaults', () => {
		const zodType = z.string().optional().default('Default')
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'string',
			input: 'input',
			validator: zodType,
		})
	})

	test("generateFormField identifies ZodEnum as 'select'", () => {
		const zodType = z.enum(['Option1', 'Option2']).optional()
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'string',
			optionItems: ['Option1', 'Option2'],
			input: 'select',
			validator: zodType,
		})
	})

	test("generateFormField identifies ZodNumber as 'input'", () => {
		const zodType = z.number()
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'number',
			input: 'input',
			validator: zodType,
		})
	})

	test("generateFormField identifies ZodArray as 'multiselect'", () => {
		const zodType = z.array(z.string())
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'array',
			input: 'multiselect',
			validator: zodType,
		})
	})

	test("generateFormField identifies ZodDate as 'date'", () => {
		const zodType = z.date()
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'date',
			input: 'date',
			validator: zodType,
		})
	})

	test("generateFormField defaults to 'string' for unsupported types", () => {
		const zodType = z.any()
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'string',
			input: 'input',
			validator: zodType,
		})
	})

	test("generateFormField identifies ZodLiteral as 'boolean'", () => {
		const zodType = z.literal(true)
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'boolean',
			input: 'boolean',
			validator: zodType,
		})
	})

	test("generateFormField identifies ZodLiteral as 'string'", () => {
		// Create a custom Zod type or use any unsupported Zod type
		const zodType = z.literal('test')
		const formField = generateFormField({ validator: zodType })

		expect(formField).toEqual({
			type: 'string',
			input: 'input',
			validator: zodType,
		})
	})
})
