import type { BaseSyntheticEvent } from "react";
import { Controller, type FieldErrors, type UseFormReturn } from "react-hook-form";

import type { EntityMetadata, UserFieldName, UserFormValues } from "./types";

interface DynamicFormProps {
  metadata: EntityMetadata;
  form: UseFormReturn<UserFormValues>;
  isEditing: boolean;
  submitLabel: string;
  onSubmit: (event?: BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
}

/** Normalizes React Hook Form error messages to simple strings for the field renderer. */
const getErrorMessage = (
  errors: FieldErrors<UserFormValues>,
  fieldName: UserFieldName,
): string | undefined => {
  const message = errors[fieldName]?.message;
  return typeof message === "string" ? message : undefined;
};

/** Renders the metadata-driven user editor using the generated field configuration. */
export const DynamicForm = ({
  metadata,
  form,
  isEditing,
  submitLabel,
  onSubmit,
  onCancel,
}: DynamicFormProps) => {
  const {
    control,
    formState: { errors, isSubmitting },
    register,
  } = form;

  return (
    <section
      aria-labelledby="user-form-title"
      className="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] backdrop-blur"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Editor</p>
          <h2 id="user-form-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {isEditing ? `Edit ${metadata.entity}` : `Create ${metadata.entity}`}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This form is rendered directly from the metadata configuration and validated through a generated Zod
            schema.
          </p>
        </div>
        {isSubmitting ? (
          <span
            aria-live="polite"
            className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700"
          >
            Saving
          </span>
        ) : null}
      </div>

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          void onSubmit(event);
        }}
      >
        {metadata.fields.map((field) => {
          const errorMessage = getErrorMessage(errors, field.name);
          const errorId = `${field.name}-error`;

          if (field.type === "boolean") {
            const describedBy = errorMessage ? `${field.name}-hint ${errorId}` : `${field.name}-hint`;

            return (
              <Controller
                key={field.name}
                control={control}
                name={field.name}
                render={({ field: controlledField }) => (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{field.label}</p>
                        <p id={`${field.name}-hint`} className="mt-1 text-sm text-slate-500">
                          Control whether the user can actively access protected product areas.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-3" htmlFor={field.name}>
                        <span className="text-sm font-medium text-slate-700">
                          {controlledField.value ? "Active" : "Inactive"}
                        </span>
                        <span className="relative">
                          <input
                            aria-describedby={describedBy}
                            aria-invalid={Boolean(errorMessage)}
                            aria-label={field.label}
                            checked={controlledField.value}
                            className="peer sr-only"
                            id={field.name}
                            onBlur={controlledField.onBlur}
                            onChange={(event) => controlledField.onChange(event.target.checked)}
                            ref={controlledField.ref}
                            type="checkbox"
                          />
                          <span className="block h-7 w-12 rounded-full bg-slate-300 transition peer-checked:bg-emerald-500 peer-focus-visible:ring-2 peer-focus-visible:ring-emerald-500 peer-focus-visible:ring-offset-2" />
                          <span className="pointer-events-none absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                        </span>
                      </label>
                    </div>
                    {errorMessage ? (
                      <p id={errorId} className="mt-3 text-sm text-rose-600">
                        {errorMessage}
                      </p>
                    ) : null}
                  </div>
                )}
              />
            );
          }

          return (
            <div key={field.name} className="space-y-2">
              <label className="text-sm font-medium text-slate-900" htmlFor={field.name}>
                {field.label}
              </label>

              {field.type === "select" ? (
                <select
                  aria-describedby={errorMessage ? errorId : undefined}
                  aria-invalid={Boolean(errorMessage)}
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  id={field.name}
                  {...register(field.name)}
                >
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-describedby={errorMessage ? errorId : undefined}
                  aria-invalid={Boolean(errorMessage)}
                  className="block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                  id={field.name}
                  placeholder={field.placeholder}
                  type={field.type}
                  {...register(field.name)}
                />
              )}

              {errorMessage ? (
                <p id={errorId} className="text-sm text-rose-600">
                  {errorMessage}
                </p>
              ) : null}
            </div>
          );
        })}

        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center">
          <button
            className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Saving..." : submitLabel}
          </button>

          {isEditing ? (
            <button
              className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
              onClick={onCancel}
              type="button"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>
    </section>
  );
};
