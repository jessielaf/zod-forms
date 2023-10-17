import { expect, test, describe } from 'vitest'
import { z } from 'zod'
import { generateFormField } from '../src/index.js' // Replace with your actual module name

describe('Test getFormField', () => {
	test('generateFormField handles ZodBoolean', () => {
		const zodType = z.boolean()
		const formField = generateFormField({ zodType })
		expect(formField).toEqual({
			type: 'boolean',
			zodType,
		})
	})

	test('generateForm handles zod optional types with defaults', () => {
		const zodType = z.string().optional().default('Default')
		const formField = generateFormField({ zodType })

		expect(formField).toEqual({
			type: 'text',
			zodType,
		})
	})

	test("generateFormField identifies ZodEnum as 'select'", () => {
		const zodType = z.enum(['Option1', 'Option2']).optional()
		const formField = generateFormField({ zodType })

		expect(formField).toEqual({
			type: 'select',
			optionItems: ['Option1', 'Option2'],
			zodType,
		})
	})

	test("generateFormField identifies ZodArray as 'multiselect'", () => {
		const zodType = z.array(z.string())
		const formField = generateFormField({ zodType })

		expect(formField).toEqual({
			type: 'multiselect',
			zodType,
		})
	})

	test("generateFormField identifies ZodDate as 'date'", () => {
		const zodType = z.date()
		const formField = generateFormField({ zodType })

		expect(formField).toEqual({
			type: 'date',
			zodType,
		})
	})

	test("generateFormField defaults to 'text' for unsupported types", () => {
		// Create a custom Zod type or use any unsupported Zod type
		const zodType = z.any()
		const formField = generateFormField({ zodType })

		expect(formField).toEqual({
			type: 'text',
			zodType,
		})
	})
})
