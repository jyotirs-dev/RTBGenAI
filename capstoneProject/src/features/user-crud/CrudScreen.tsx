import { DynamicForm } from "./DynamicForm";
import { EntityTable } from "./EntityTable";
import { type EntityMetadata, USER_ROLE_OPTIONS } from "./types";
import { useCrudLogic } from "./useCrudLogic";

const userMetadata: EntityMetadata = {
  entity: "User",
  fields: [
    {
      name: "fullName",
      label: "Full Name",
      type: "text",
      validation: "required",
      placeholder: "John Doe",
    },
    {
      name: "email",
      label: "Email Address",
      type: "email",
      validation: "email",
      placeholder: "john@example.com",
    },
    {
      name: "role",
      label: "User Role",
      type: "select",
      options: USER_ROLE_OPTIONS,
      validation: "required",
    },
    {
      name: "status",
      label: "Active Status",
      type: "boolean",
      defaultValue: true,
    },
  ],
};

export const CrudScreen = () => {
  const { form, users, editingUser, isEditing, submitLabel, submitUser, startEditing, cancelEditing, deleteUser } =
    useCrudLogic(userMetadata);

  const activeUsers = users.filter((user) => user.status).length;

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_38%),linear-gradient(180deg,_#f8fafc_0%,_#ecfeff_45%,_#f8fafc_100%)] px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/80 p-6 shadow-[0_30px_120px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-teal-700">Metadata Driven CRUD</p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                User administration generated from a single schema contract.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                The form, validation, mock persistence, and list rendering all derive from one metadata definition so
                the screen stays maintainable as fields evolve.
              </p>
            </div>

            <dl className="grid grid-cols-2 gap-4 rounded-[1.75rem] bg-slate-950 p-5 text-white shadow-inner">
              <div className="rounded-2xl bg-white/8 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-300">Total Users</dt>
                <dd className="mt-2 text-3xl font-semibold">{users.length}</dd>
              </div>
              <div className="rounded-2xl bg-white/8 p-4">
                <dt className="text-xs uppercase tracking-[0.2em] text-slate-300">Active Users</dt>
                <dd className="mt-2 text-3xl font-semibold">{activeUsers}</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <DynamicForm
            form={form}
            isEditing={isEditing}
            metadata={userMetadata}
            onCancel={cancelEditing}
            onSubmit={form.handleSubmit(submitUser)}
            submitLabel={submitLabel}
          />

          <EntityTable
            activeRecordId={editingUser?.id ?? null}
            onDelete={deleteUser}
            onEdit={startEditing}
            records={users}
          />
        </div>
      </div>
    </main>
  );
};

export default CrudScreen;
