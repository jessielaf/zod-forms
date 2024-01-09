import { z } from 'zod'
export interface FieldMeta {}

export const FieldTypes = ['string', 'number', 'boolean', 'array', 'date'] as const
export const InputTypes = ['input', 'boolean', 'select', 'multiselect', 'date', 'range'] as const

type FieldType = (typeof FieldTypes)[number]
type InputType = (typeof InputTypes)[number]

export interface FormField {
	type: Omit<FieldType, 'select' | 'multiselect' | 'select'>
	input: InputType
	zodType: z.ZodType<any>
	meta?: FieldMeta
}

export interface SelectFormField extends FormField {
	input: 'select' | 'multiselect'
	optionItems?: string[]
}

export interface RangeFormField extends FormField {
	input: 'range'
	range?: { min: number; max: number }
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

export const generateFormField = (
	formField: Omit<FormField, 'type' | 'input'>,
): FormField | RangeFormField | SelectFormField => {
	const strippedZodType = stripZodType(formField.zodType)

	if (strippedZodType instanceof z.ZodBoolean) {
		return {
			type: 'boolean',
			input: 'boolean',
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodNumber) {
		if (Number.isFinite(strippedZodType.maxValue) && Number.isFinite(strippedZodType.minValue)) {
			return {
				type: 'number',
				input: 'range',
				range: {
					min: strippedZodType.minValue as number,
					max: strippedZodType.maxValue as number,
				},
				...formField,
			}
		}

		return {
			type: 'number',
			input: 'input',
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodEnum) {
		return {
			type: 'string',
			input: 'select',
			optionItems: strippedZodType._def.values,
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodArray) {
		return {
			...generateFormField({ zodType: strippedZodType._def.type }),
			type: 'array',
			input: 'multiselect',
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodDate) {
		return {
			type: 'date',
			input: 'date',
			...formField,
		}
	}

	return {
		type: 'string',
		input: 'input',
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
