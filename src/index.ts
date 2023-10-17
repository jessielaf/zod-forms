import { z } from 'zod'
import { c } from 'vitest/dist/reporters-5f784f42'
export interface FieldMeta {}

export const FieldTypes = ['text', 'number', 'boolean', 'select', 'multiselect', 'date'] as const

type FieldType = (typeof FieldTypes)[number]

export interface FormField {
	type: FieldType
	zodType: z.ZodType<any>
	meta?: FieldMeta
	optionItems?: string[]
}

type AllowedObjects = z.AnyZodObject | z.ZodEffects<any, any, any> | z.ZodTransformer<any, any, any>

export const stripZodType = (zodType: z.ZodType) => {
	if (
		zodType instanceof z.ZodDefault ||
		zodType instanceof z.ZodOptional ||
		zodType instanceof z.ZodNullable
	) {
		return stripZodType(zodType._def.innerType)
	}

	return zodType
}

export const generateFormField = (formField: Omit<FormField, 'type'>): FormField => {
	const strippedZodType = stripZodType(formField.zodType)

	if (strippedZodType instanceof z.ZodBoolean) {
		return {
			type: 'boolean',
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodNumber) {
		return {
			type: 'number',
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodEnum) {
		return {
			type: 'select',
			optionItems: strippedZodType._def.values,
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodArray) {
		return {
			...generateFormField({ zodType: strippedZodType._def.type }),
			type: 'multiselect',
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodDate) {
		return {
			type: 'date',
			...formField,
		}
	}

	return {
		type: 'text',
		...formField,
	}
}

const stripZodObject = (schema: AllowedObjects): z.AnyZodObject => {
	if (schema instanceof z.ZodEffects || schema instanceof z.ZodTransformer) {
		return schema._def.schema
	}

	return schema
}

export const generateForm = <T extends AllowedObjects>(
	schema: T,
	meta?: Record<keyof z.infer<T>, FieldMeta>,
): Record<string, FormField> => {
	const strippedSchema = stripZodObject(schema)

	return Object.fromEntries(
		Object.entries(strippedSchema._def.shape()).map(([key, value]) => {
			return [key, generateFormField({ zodType: value as z.ZodType<any>, meta: meta?.[key] })]
		}),
	)
}
