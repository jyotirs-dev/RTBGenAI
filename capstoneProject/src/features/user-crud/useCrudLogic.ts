import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { type SubmitHandler, type UseFormReturn, useForm } from "react-hook-form";
import { z } from "zod";

import {
  type EntityMetadata,
  type UserFieldMetadata,
  type UserFormValues,
  type UserRecord,
  USER_ROLE_OPTIONS,
} from "./types";

const MOCK_API_DELAY_MS = 1000;

const INITIAL_USERS: UserRecord[] = [
  {
    id: "user-1",
    fullName: "Ada Lovelace",
    email: "ada.lovelace@example.com",
    role: "Admin",
    status: true,
  },
  {
    id: "user-2",
    fullName: "Grace Hopper",
    email: "grace.hopper@example.com",
    role: "Editor",
    status: true,
  },
  {
    id: "user-3",
    fullName: "Alan Turing",
    email: "alan.turing@example.com",
    role: "Viewer",
    status: false,
  },
];

/** Wraps the mock API delay so create and update flows behave like async requests. */
const wait = (durationMs: number): Promise<void> =>
  new Promise((resolve) => {
    globalThis.setTimeout(resolve, durationMs);
  });

/** Returns a strongly typed field descriptor so helper functions can read field-level rules safely. */
const getFieldByName = <TName extends UserFieldMetadata["name"]>(
  metadata: EntityMetadata,
  name: TName,
): Extract<UserFieldMetadata, { name: TName }> | undefined =>
  metadata.fields.find((field): field is Extract<UserFieldMetadata, { name: TName }> => field.name === name);

/** Builds a Zod schema directly from the metadata so the UI and validation rules stay aligned. */
const buildUserSchema = (metadata: EntityMetadata) => {
  const fullNameField = getFieldByName(metadata, "fullName");
  const emailField = getFieldByName(metadata, "email");
  const roleField = getFieldByName(metadata, "role");

  const fullNameSchema =
    fullNameField?.validation === "required"
      ? z.string().trim().min(1, `${fullNameField.label} is required`)
      : z.string().trim();

  const emailSchema =
    emailField?.validation === "email"
      ? z
          .string()
          .trim()
          .min(1, `${emailField.label} is required`)
          .email(`${emailField.label} must be a valid email address`)
      : emailField?.validation === "required"
        ? z.string().trim().min(1, `${emailField.label} is required`)
        : z.string().trim();

  const roleOptions = roleField?.options ?? USER_ROLE_OPTIONS;
  const roleSchema = z.enum(roleOptions, {
    error: roleField ? `${roleField.label} is required` : "Role is required",
  });

  return z.object({
    fullName: fullNameSchema,
    email: emailSchema,
    role: roleSchema,
    status: z.boolean(),
  });
};

/** Derives the form defaults from metadata to keep create and reset flows consistent. */
const buildDefaultValues = (metadata: EntityMetadata): UserFormValues => {
  const roleField = getFieldByName(metadata, "role");

  return {
    fullName: getFieldByName(metadata, "fullName")?.defaultValue ?? "",
    email: getFieldByName(metadata, "email")?.defaultValue ?? "",
    role: roleField?.defaultValue ?? roleField?.options[0] ?? "Viewer",
    status: getFieldByName(metadata, "status")?.defaultValue ?? true,
  };
};

/** Converts a stored record back into the form shape used by React Hook Form. */
const toFormValues = (record: UserRecord): UserFormValues => ({
  fullName: record.fullName,
  email: record.email,
  role: record.role,
  status: record.status,
});

/** Generates a stable client-side record id even when `crypto.randomUUID` is unavailable. */
const createRecordId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `user-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

/** Public state and actions exposed by the metadata-driven CRUD hook. */
export interface UseCrudLogicResult {
  form: UseFormReturn<UserFormValues>;
  users: UserRecord[];
  editingUser: UserRecord | null;
  isEditing: boolean;
  submitLabel: string;
  submitUser: SubmitHandler<UserFormValues>;
  startEditing: (user: UserRecord) => void;
  cancelEditing: () => void;
  deleteUser: (userId: string) => void;
}

/** Owns the CRUD state machine, generated validation, and simulated persistence for the screen. */
export const useCrudLogic = (metadata: EntityMetadata): UseCrudLogicResult => {
  const defaultValues = useMemo(() => buildDefaultValues(metadata), [metadata]);
  const validationSchema = useMemo(() => buildUserSchema(metadata), [metadata]);
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues,
    mode: "onBlur",
  });

  const editingUser = useMemo(
    () => users.find((user) => user.id === editingUserId) ?? null,
    [editingUserId, users],
  );

  const cancelEditing = (): void => {
    setEditingUserId(null);
    form.reset(defaultValues);
  };

  const startEditing = (user: UserRecord): void => {
    setEditingUserId(user.id);
    form.reset(toFormValues(user));
  };

  const deleteUser = (userId: string): void => {
    setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));

    if (editingUserId === userId) {
      cancelEditing();
    }
  };

  const submitUser: SubmitHandler<UserFormValues> = async (values) => {
    await wait(MOCK_API_DELAY_MS);

    if (editingUserId !== null) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUserId
            ? {
                ...user,
                ...values,
              }
            : user,
        ),
      );
    } else {
      setUsers((currentUsers) => [
        {
          id: createRecordId(),
          ...values,
        },
        ...currentUsers,
      ]);
    }

    cancelEditing();
  };

  return {
    form,
    users,
    editingUser,
    isEditing: editingUser !== null,
    submitLabel: editingUser ? `Update ${metadata.entity}` : `Create ${metadata.entity}`,
    submitUser,
    startEditing,
    cancelEditing,
    deleteUser,
  };
};
