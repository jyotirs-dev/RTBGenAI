/** Supported validation rules that can be attached to generated form fields. */
export type ValidationRule = "required" | "email";

/** Role values supported by the metadata-driven user editor. */
export type UserRole = "Admin" | "Editor" | "Viewer";

/** Stable option list reused by the form metadata and Zod schema. */
export const USER_ROLE_OPTIONS = ["Admin", "Editor", "Viewer"] as const satisfies readonly [
  UserRole,
  ...UserRole[],
];

/** Form values managed by React Hook Form for the user editor. */
export interface UserFormValues {
  fullName: string;
  email: string;
  role: UserRole;
  status: boolean;
}

/** Persisted in-memory record shape rendered by the table and cards. */
export interface UserRecord extends UserFormValues {
  id: string;
}

/** Shared metadata contract for the generated field descriptors. */
interface BaseField<Name extends keyof UserFormValues, Type extends string> {
  name: Name;
  label: string;
  type: Type;
  validation?: ValidationRule;
  placeholder?: string;
  defaultValue?: UserFormValues[Name];
}

/** Metadata for a required free-text name field. */
export interface TextFieldMetadata extends BaseField<"fullName", "text"> {
  validation?: "required";
}

/** Metadata for the email field, including email-format validation. */
export interface EmailFieldMetadata extends BaseField<"email", "email"> {
  validation?: "required" | "email";
}

/** Metadata for the role selector rendered from the supported role options. */
export interface SelectFieldMetadata extends BaseField<"role", "select"> {
  validation?: "required";
  options: readonly [UserRole, ...UserRole[]];
}

/** Metadata for the boolean active-status toggle. */
export interface BooleanFieldMetadata extends BaseField<"status", "boolean"> {
  defaultValue?: boolean;
}

/** Union of the user-field descriptors understood by the dynamic form renderer. */
export type UserFieldMetadata =
  | TextFieldMetadata
  | EmailFieldMetadata
  | SelectFieldMetadata
  | BooleanFieldMetadata;

/** Top-level metadata contract used to generate the complete CRUD screen. */
export interface EntityMetadata {
  entity: "User";
  fields: readonly UserFieldMetadata[];
}

/** Field-name union used to safely look up validation and error states. */
export type UserFieldName = UserFieldMetadata["name"];
