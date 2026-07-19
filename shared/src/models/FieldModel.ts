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

  
  /**
   * Structural path supplied by the form framework.
   * Example:
   * parents>parentCarers[1].parentCarerGivenName
   */
  bindingPath?: string;

  /**
   * Logical entity represented by the field.
   */
  entityType?: FormEntityType;

  /**
   * Index for repeated entities.
   * Example: parentCarers[1] → 1.
   */
  entityIndex?: number;

  /**
   * Property inferred from the structural binding.
   * Example: parentCarerGivenName.
   */
  bindingProperty?: string;

  /**
   * Groups individual radio/checkbox controls into one question.
   */
  logicalFieldId?: string;
}

export type FormEntityType =
  | "student"
  | "parentCarer"
  | "address"
  | "household"
  | "unknown";

