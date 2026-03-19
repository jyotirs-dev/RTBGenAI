import { useEffect } from "react";
import { DynamicForm } from "./DynamicForm";
import { EntityTable } from "./EntityTable";
import { useCrudLogic } from "./useCrudLogic";
import type { EntityMetadata } from "./types";

interface LazyFormSectionProps {
  metadata: EntityMetadata;
  onStatsChange: (stats: { total: number; active: number }) => void;
}

export default function LazyFormSection({ metadata, onStatsChange }: LazyFormSectionProps) {
  const { form, users, editingUser, isEditing, submitLabel, submitUser, startEditing, cancelEditing, deleteUser } =
    useCrudLogic(metadata);

  useEffect(() => {
    onStatsChange({
      total: users.length,
      active: users.filter((user) => user.status).length,
    });
  }, [users, onStatsChange]);

  return (
    <div className="grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
      <DynamicForm
        form={form}
        isEditing={isEditing}
        metadata={metadata}
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
  );
}
