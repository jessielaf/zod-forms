import { describe, test, expect } from 'vitest'
import { stripZodType } from '../src'
import { z } from 'zod'

describe('stripZodType', () => {
	test('should return the inner type of ZodDefault', () => {
		const innerType = z.string()
		const zodType = innerType.default('test')
		const result = stripZodType(zodType)
		expect(result).toEqual(innerType)
	})

	test('should return the inner type of ZodOptional', () => {
		const innerType = z.string()
		const zodType = innerType.optional()
		const result = stripZodType(zodType)
		expect(result).toEqual(innerType)
	})

	test('should return the inner type of ZodNullable', () => {
		const innerType = z.string()
		const zodType = innerType.nullable()
		const result = stripZodType(zodType)
		expect(result).toEqual(innerType)
	})

	test('should return the same type if not ZodDefault or ZodOptional', () => {
		const zodType = z.string()
		const result = stripZodType(zodType)
		expect(result).toEqual(zodType)
	})

	test('should handle nested ZodDefault and ZodOptional', () => {
		const innerType = z.string()
		const nestedType = innerType.optional().default('')
		const result = stripZodType(nestedType)
		expect(result).toEqual(innerType)
	})
})
