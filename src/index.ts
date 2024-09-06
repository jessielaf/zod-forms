import { z } from 'zod'

export interface FieldMeta {}

export const FieldTypes = ['string', 'number', 'boolean', 'array', 'date'] as const
export const InputTypes = ['input', 'boolean', 'select', 'multiselect', 'date', 'range'] as const

type FieldType = (typeof FieldTypes)[number]
type InputType = (typeof InputTypes)[number]

const defaultFieldToInput: Record<FieldType, InputType> = {
  string: 'input',
  number: 'input',
  boolean: 'boolean',
  array: 'multiselect',
  date: 'date',
}

export interface FormField {
  accessor: string
  type: Omit<FieldType, 'select' | 'multiselect' | 'select'>
  input: InputType
  validator: z.ZodType<any>
  meta?: FieldMeta
}

export interface SelectFormField extends FormField {
  input: 'select' | 'multiselect'
  optionItems?: string[]
}

type AllowedObjects = z.AnyZodObject | z.ZodEffects<any, any, any> | z.ZodTransformer<any, any, any>

export function stripZodType(zodType: z.ZodType): z.ZodType {
  if (
    zodType instanceof z.ZodDefault
    || zodType instanceof z.ZodOptional
    || zodType instanceof z.ZodNullable
  ) {
    return stripZodType(zodType._def.innerType)
  }

  return zodType
}

export function generateFormField(formField: Omit<FormField, 'type' | 'input' | 'accessor'>): Omit<FormField, 'accessor'> | Omit<SelectFormField, 'accessor'> {
  const strippedZodType = stripZodType(formField.validator)

  if (strippedZodType instanceof z.ZodBoolean) {
    return {
      type: 'boolean',
      input: defaultFieldToInput.boolean,
      ...formField,
    }
  }
  else if (strippedZodType instanceof z.ZodNumber) {
    return {
      type: 'number',
      input: defaultFieldToInput.number,
      ...formField,
    }
  }
  else if (strippedZodType instanceof z.ZodEnum) {
    return {
      type: 'string',
      input: 'select',
      optionItems: strippedZodType._def.values,
      ...formField,
    }
  }
  else if (strippedZodType instanceof z.ZodArray) {
    return {
      ...generateFormField({ validator: strippedZodType._def.type }),
      type: 'array',
      input: defaultFieldToInput.array,
      ...formField,
    }
  }
  else if (strippedZodType instanceof z.ZodDate) {
    return {
      type: 'date',
      input: defaultFieldToInput.date,
      ...formField,
    }
  }
  else if (strippedZodType instanceof z.ZodLiteral) {
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

export function generateForm<T extends AllowedObjects>(schema: T,	meta?: Record<keyof z.infer<T>, FieldMeta>): Record<string, FormField> {
  const strippedSchema = stripZodObject(schema)

  return Object.fromEntries(
    Object.entries(strippedSchema._def.shape()).map(([key, value]) => {
      return [
        key,
        {
          accessor: key,
          ...generateFormField({ validator: value as z.ZodType<any>, meta: meta?.[key] }),
        },
      ]
    }),
  )
}
