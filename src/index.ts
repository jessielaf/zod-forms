import { z } from 'zod'

export interface FieldMeta {}

export const FieldTypes = [
	'string',
	'number',
	'boolean',
	'array',
	'date',
] as const
export const InputTypes = [
	'input',
	'boolean',
	'select',
	'multiselect',
	'date',
] as const

export type FieldType = (typeof FieldTypes)[number]
export type InputType = (typeof InputTypes)[number]

const defaultFieldToInput: Record<FieldType, InputType> = {
	string: 'input',
	number: 'input',
	boolean: 'boolean',
	array: 'multiselect',
	date: 'date',
}

export interface BaseFormField extends FieldMeta {
	accessor: string
	type: Omit<FieldType, 'select' | 'multiselect'>
	input: InputType
	validator: z.ZodType<any>
}

export interface SelectFormField extends BaseFormField {
	input: 'select' | 'multiselect'
	optionItems?: string[]
}

export function isSelectFormField(field: FormField): field is SelectFormField {
	return field.input === 'select' || field.input === 'multiselect'
}

export type FormField = BaseFormField | SelectFormField

type AllowedObjects =
	| z.AnyZodObject
	| z.ZodEffects<any, any, any>
	| z.ZodTransformer<any, any, any>

export function stripZodType(zodType: z.ZodType): z.ZodType {
	if (
		zodType instanceof z.ZodDefault ||
		zodType instanceof z.ZodOptional ||
		zodType instanceof z.ZodNullable
	) {
		return stripZodType(zodType._def.innerType)
	}

	return zodType
}

export function generateFormField(
	formField: Omit<FormField, 'type' | 'input' | 'accessor'>
): Omit<FormField, 'accessor'> {
	const strippedZodType = stripZodType(formField.validator)

	if (strippedZodType instanceof z.ZodBoolean) {
		return {
			type: 'boolean',
			input: defaultFieldToInput.boolean,
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodNumber) {
		return {
			type: 'number',
			input: defaultFieldToInput.number,
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodEnum) {
		return {
			type: 'string',
			input: 'select',
			optionItems: strippedZodType._def.values,
			...formField,
		} as Omit<SelectFormField, 'accessor'>
	} else if (strippedZodType instanceof z.ZodArray) {
		return {
			...generateFormField({ validator: strippedZodType._def.type }),
			type: 'array',
			input: defaultFieldToInput.array,
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodDate) {
		return {
			type: 'date',
			input: defaultFieldToInput.date,
			...formField,
		}
	} else if (strippedZodType instanceof z.ZodLiteral) {
		const literalType = typeof strippedZodType._def.value
		const calcType = FieldTypes.includes(literalType as FieldType)
			? (literalType as FieldType)
			: 'string'
		return {
			type: calcType,
			input: defaultFieldToInput[calcType] || 'input',
			...formField,
		}
	}

	return {
		type: 'string',
		input: 'input',
		...formField,
	}
}

function stripZodObject(schema: AllowedObjects): z.AnyZodObject {
	if (schema instanceof z.ZodEffects || schema instanceof z.ZodTransformer) {
		return schema._def.schema
	}

	return schema
}

export function generateForm<T extends AllowedObjects>(
	schema: T,
	overwrite?: Partial<Record<keyof z.infer<T>, Partial<FormField>>>
): Record<string, FormField> {
	const strippedSchema = stripZodObject(schema)

	return Object.fromEntries(
		Object.entries(strippedSchema._def.shape()).map(([key, value]) => {
			return [
				key,
				{
					accessor: key,
					...generateFormField({ validator: value as z.ZodType<any> }),
					...overwrite?.[key],
				},
			]
		})
	)
}
