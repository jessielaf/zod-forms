# @jcb/zod-forms

## Overview
This TypeScript library aims to simplify the task of generating form fields based on Zod schemas. If you're building forms and using Zod for validation, this library will automate much of the heavy lifting. It provides functionalities to generate form fields with meta-information that could be used for rendering the fields on the frontend.

## Installation

```
npm install zod @jcb/zod-forms
```

## Example

Below shows an example in svelte

```svelte
<script lang="ts">
  import { z } from 'zod';
  import { generateForm } from '@jlaf/zod-forms';

  const userSchema = z.object({
    name: z.string(),
    age: z.number(),
  });
  
  const formFields = generateForm(userSchema, {
    name: {
      label: 'First name'
    }
  })
  
  let value: z.infer<userSchema> = userSchema.default()
</script>

{#each Object.entries(formFields) as [key, formField]}
    <label for="key">{formField.meta?.label || key}</label>
    <input type="formField.type" bind:value="value[key]" />
{/each}
```

This setup seems trivial when first looking at it. However, zod-forms is created to work alongside a database layer such as `prisma` or `drizzle` where you don't generate your own zod schemas.

## Usage

This libary revolves around the `FormField` type. The typelooks as follows:

```typescript
interface FormField {
  type: ['text', 'number', 'boolean', 'select', 'multiselect', 'date'];
  zodType: z.ZodType<any>;
  meta?: FieldMeta;
}
```

The main function exported by zod-forms is `generateForm`. This function returns a `Record<string, FormField>`. The usage looks as following:

```typescript
import { z } from 'zod';
import { generateForm } from '@jlaf/zod-forms';

const userSchema = z.object({
  name: z.string(),
  age: z.number(),
  gender: z.enum(['Male', 'Female', 'Other'])
});

const formFields = generateForm(userSchema, {
  name: {
    label: 'Firstname'
  }
});
```

The **generated** object will look like the following:

```typescript
const formFields = {
  name: {
    type: 'text',
    zodType: z.string(),
    meta: {
      label: 'Firstname'
    }
  },
  age: {
    type: 'number',
    zodType: z.number(),
  },
  age: {
    type: 'number',
    optionItems: ['Male', 'Female', 'Other'],
    zodType: z.enum(['Male', 'Female', 'Other']),
  }
}
```


### Forcing field meta

If you want to force the field meta to be of a certain type because you want to use it for automatic form generation you can use the following overrides:

```typescript
declare module '@jlaf/zod-forms' {
  export interface FieldMeta {
    label: string
  }
}
```

## Contributing
Feel free to open issues or submit PRs to enhance the functionalities.
