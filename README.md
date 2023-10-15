# @jcb/zod-forms

## Overview
This TypeScript library aims to simplify the task of generating form fields based on Zod schemas. If you're building forms and using Zod for validation, this library will automate much of the heavy lifting. It provides functionalities to generate form fields with meta-information that could be used for rendering the fields on the frontend.

## Installation

```
npm install zod @jcb/zod-forms
```

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
