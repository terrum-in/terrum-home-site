export type FieldOption = {
  id: string;
  label: string;
  value: string;
};

export type FormField = {
  id: string;
  name?: string;
  label?: string;
  required?: boolean;
  blockType:
    | "text"
    | "number"
    | "email"
    | "select"
    | "checkbox"
    | "textarea"
    | "message";
  options?: FieldOption[];
  message?: {
    root?: {
      children?: { children?: { text: string }[] }[];
    };
  };
};

export type FormData = {
  id: number;
  title: string;
  fields: FormField[];
  submitButtonLabel: string;
  redirect?: {
    url: string;
  };
};
