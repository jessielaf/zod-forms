import {assert, test} from "vitest";
import { z } from "zod";
import { getZodType } from "../src/index.js"; // Replace with your actual module name

test("getZodType handles ZodDefault", () => {
  const zodType = z.string().default("default");
  const type = getZodType(zodType);
  assert.equal(type, "text");
});

test("getZodType handles ZodOptional", () => {
  const zodType = z.string().optional();
  const type = getZodType(zodType);
  assert.equal(type, "text");
});

test("getZodType handles ZodBoolean", () => {
  const type = getZodType(z.boolean());
  assert.equal(type, "boolean");
});

test("generateForm handles zod optional types with defaults", () => {
  const type = getZodType(z.string().optional().default("Default"));

  assert.equal(type, "text");
});

test("getZodType identifies ZodEnum as 'select'", () => {
  const zodEnumType = z.enum(["Option1", "Option2"]);
  const fieldType = getZodType(zodEnumType);

  assert.equal(fieldType, "select");
});

test("getZodType identifies ZodArray as 'multiselect'", () => {
  const zodArrayType = z.array(z.string());
  const fieldType = getZodType(zodArrayType);

  assert.equal(fieldType, "multiselect");
});

test("getZodType identifies ZodDate as 'date'", () => {
  const zodDateType = z.date();
  const fieldType = getZodType(zodDateType);

  assert.equal(fieldType, "date");
});

test("getZodType defaults to 'text' for unsupported types", () => {
  // Create a custom Zod type or use any unsupported Zod type
  const customType = z.any();
  const fieldType = getZodType(customType);

  assert.equal(fieldType, "text"); // Assuming "text" is your default
});
