export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "checkbox"
  | "radio"
  | "select"
  | "file"
  | "unknown";

export interface FieldOption {
  label: string;
  value: string;
}

export interface FieldModel {
  fieldId: string;
  label: string;
  name?: string;
  title?: string;
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

  /**
   * For checkbox/radio groups, this is the visible option label for the individual control.
   * Example: "Female" inside "Student's gender".
   */
  optionLabel?: string;

  /**
   * For checkbox/radio groups, this is the inferred group label.
   * Example: "Student's gender".
   */
  groupLabel?: string;
}
