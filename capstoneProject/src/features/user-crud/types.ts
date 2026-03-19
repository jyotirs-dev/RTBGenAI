export type ValidationRule = "required" | "email";

export type UserRole = "Admin" | "Editor" | "Viewer";

export const USER_ROLE_OPTIONS = ["Admin", "Editor", "Viewer"] as const satisfies readonly [
  UserRole,
  ...UserRole[],
];

export interface UserFormValues {
  fullName: string;
  email: string;
  role: UserRole;
  status: boolean;
}

export interface UserRecord extends UserFormValues {
  id: string;
}

interface BaseField<Name extends keyof UserFormValues, Type extends string> {
  name: Name;
  label: string;
  type: Type;
  validation?: ValidationRule;
  placeholder?: string;
  defaultValue?: UserFormValues[Name];
}

export interface TextFieldMetadata extends BaseField<"fullName", "text"> {
  validation?: "required";
}

export interface EmailFieldMetadata extends BaseField<"email", "email"> {
  validation?: "required" | "email";
}

export interface SelectFieldMetadata extends BaseField<"role", "select"> {
  validation?: "required";
  options: readonly [UserRole, ...UserRole[]];
}

export interface BooleanFieldMetadata extends BaseField<"status", "boolean"> {
  defaultValue?: boolean;
}

export type UserFieldMetadata =
  | TextFieldMetadata
  | EmailFieldMetadata
  | SelectFieldMetadata
  | BooleanFieldMetadata;

export interface EntityMetadata {
  entity: "User";
  fields: readonly UserFieldMetadata[];
}

export type UserFieldName = UserFieldMetadata["name"];
