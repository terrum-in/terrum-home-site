export type FormSubmissionResponse = {
  doc: {
    id: number;
    form: {
      id: number;
      title: string;
      fields: Array<{
        id: string;
        name?: string;
        label?: string;
        width?: number | null;
        defaultValue?: string | null;
        required?: boolean | null;
        blockName?: string | null;
        blockType: string;
        options?: Array<{ id: string; label: string; value: string }>;
        message?: any; // Kept flexible due to nested structure
      }>;
      submitButtonLabel: string;
      confirmationType: "redirect" | "message";
      confirmationMessage?: string | null;
      redirect?: { url: string } | null;
      updatedAt: string;
      createdAt: string;
      emails?: Array<string>;
    };
    submissionData: Array<{
      id: string;
      field: string;
      value: string;
    }>;
    updatedAt: string;
    createdAt: string;
  };
  message: string;
};
