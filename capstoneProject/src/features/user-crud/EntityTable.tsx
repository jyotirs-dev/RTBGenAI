import type { UserRecord } from "./types";

interface EntityTableProps {
  records: UserRecord[];
  activeRecordId: string | null;
  onEdit: (record: UserRecord) => void;
  onDelete: (recordId: string) => void;
}

const statusClasses: Record<"active" | "inactive", string> = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-200 text-slate-600",
};

export const EntityTable = ({ records, activeRecordId, onEdit, onDelete }: EntityTableProps) => {
  if (records.length === 0) {
    return (
      <section
        aria-live="polite"
        className="rounded-3xl border border-dashed border-slate-300 bg-white/80 p-10 text-center shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)]"
      >
        <h2 className="text-xl font-semibold text-slate-950">No users yet</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Create a user from the metadata-driven form to populate the list and verify the CRUD interactions.
        </p>
      </section>
    );
  }

  return (
    <section aria-labelledby="user-table-title" className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-700">Records</p>
          <h2 id="user-table-title" className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            Existing Users
          </h2>
        </div>
        <p className="text-sm text-slate-500">{records.length} total records</p>
      </div>

      <ul className="grid gap-4 md:hidden">
        {records.map((record) => {
          const isActiveRow = activeRecordId === record.id;
          const statusKey = record.status ? "active" : "inactive";

          return (
            <li
              key={record.id}
              className={`rounded-3xl border bg-white p-5 shadow-sm transition ${
                isActiveRow ? "border-teal-400 ring-2 ring-teal-200" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-slate-950">{record.fullName}</p>
                  <p className="mt-1 text-sm text-slate-500">{record.email}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[statusKey]}`}>
                  {record.status ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                  {record.role}
                </span>
                <div className="flex gap-2">
                  <button
                    aria-label={`Edit ${record.fullName}`}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                    onClick={() => onEdit(record)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    aria-label={`Delete ${record.fullName}`}
                    className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                    onClick={() => onDelete(record.id)}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.25)] md:block">
        <table className="min-w-full border-collapse">
          <thead className="bg-slate-50">
            <tr>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                scope="col"
              >
                Name
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                scope="col"
              >
                Email
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                scope="col"
              >
                Role
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                scope="col"
              >
                Status
              </th>
              <th
                className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
                scope="col"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => {
              const isActiveRow = activeRecordId === record.id;
              const statusKey = record.status ? "active" : "inactive";

              return (
                <tr
                  key={record.id}
                  className={`border-t border-slate-200 transition ${
                    isActiveRow ? "bg-teal-50/80" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-5 align-top">
                    <div className="font-medium text-slate-950">{record.fullName}</div>
                  </td>
                  <td className="px-6 py-5 align-top text-slate-600">{record.email}</td>
                  <td className="px-6 py-5 align-top">
                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                      {record.role}
                    </span>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses[statusKey]}`}>
                      {record.status ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Edit ${record.fullName}`}
                        className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                        onClick={() => onEdit(record)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        aria-label={`Delete ${record.fullName}`}
                        className="rounded-xl border border-rose-200 px-3 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
                        onClick={() => onDelete(record.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
