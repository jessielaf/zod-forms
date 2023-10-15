import {expect, test} from "vitest";
import { z } from "zod";
import { FieldMeta, generateFormField } from "../src/index.js"; // Replace with your actual module name

test("generateFormField creates FormField with given params", () => {
  const zodType = z.string();
  const meta: FieldMeta = {}; // Or set with any mock FieldMeta

  const formField = generateFormField(zodType, meta);

  expect(formField).toEqual({
    zodType,
    type: "text",
    meta
  });
});
