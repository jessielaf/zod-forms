import { z } from "zod";
export interface FieldMeta {}

const FieldTypes = ['text', 'number', 'boolean', 'select', 'multiselect', 'date'] as const

type FieldType = typeof FieldTypes[number]

interface FormField {
  type: FieldType;
  zodType: z.ZodType<any>;
  meta?: FieldMeta;
}

type AllowedObjects =
  | z.AnyZodObject
  | z.ZodEffects<any, any, any>
  | z.ZodTransformer<any, any, any>;

export const getZodType = (zodType: z.ZodType<any>): FieldType  => {
  if (zodType instanceof z.ZodDefault || zodType instanceof z.ZodOptional) {
    return getZodType(zodType._def.innerType);
  }

  if (zodType instanceof z.ZodBoolean) {
    return 'boolean'
  } else if (zodType instanceof z.ZodNumber) {
    return 'number'
  } else if (zodType instanceof z.ZodEnum) {
    return 'select'
  } else if (zodType instanceof z.ZodArray) {
    return 'multiselect'
  } else if (zodType instanceof z.ZodDate) {
    return 'date';
  }

  return 'text'
}

const stripZodObject = (schema: AllowedObjects): z.AnyZodObject => {
  if (schema instanceof z.ZodEffects || schema instanceof z.ZodTransformer) {
    return schema._def.schema;
  }

  return schema;
};

export const generateFormField = (
  zodType: z.ZodType<any>,
  meta?: FieldMeta
): FormField => {
  return {
    zodType,
    type: getZodType(zodType),
    meta
  }
};

export const generateForm = <T extends AllowedObjects>(
  schema: T,
  meta?: Record<keyof z.infer<T>, FieldMeta>
): Record<string, FormField> => {
  const strippedSchema = stripZodObject(schema)

  return Object.fromEntries(Object.entries(strippedSchema._def.shape()).map(([key, value]) => {
      return [key, generateFormField(value as z.ZodType<any>, meta?.[key])]
    })
  );
};
