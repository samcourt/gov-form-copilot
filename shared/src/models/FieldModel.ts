export type FieldType =
  | "text" | "textarea" | "date" | "checkbox" | "radio" | "select" | "file" | "unknown";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldModel {
  fieldId: string;
  label: string;
  name?: string;
  fieldType: FieldType;
  required: boolean;
  visible: boolean;
  currentValue?: string;
  placeholder?: string;
  helpText?: string;
  validation?: string;
  options: FieldOption[];
  safeToFill: boolean;
  section?: string;
}
