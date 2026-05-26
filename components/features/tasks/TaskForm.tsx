"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createTaskAction } from "@/actions/task.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Property = {
  id: string;
  name: string;
};

type Operator = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  properties: Property[];
  operators: Operator[];

  // Optional: pre-select a property (when form is opened from property detail page)
  defaultPropertyId?: string | undefined;
};

const TaskForm = ({ properties, operators, defaultPropertyId }: Props) => {
  const router = useRouter();

  const [pending, setPending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [propertyId, setPropertyId] = useState(defaultPropertyId ?? "");

  const [assignedToId, setAssignedToId] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPending(true);
    setError(null);

    const form = e.currentTarget;

    const formData = new FormData(form);

    formData.set("propertyId", propertyId);
    formData.set("assignedToId", assignedToId);

    const result = await createTaskAction(formData);

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    // Navigate to task list on success — form is typically in a dialog/sheet
    router.push("/dashboard/tasks");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Task title */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="title"
          className="text-xs font-medium text-(--color-text-600)"
        >
          Title <span aria-hidden="true">*</span>
        </Label>

        <Input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. Deep clean bathroom"
          className="input-base"
          maxLength={150}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="description"
          className="text-xs font-medium text-(--color-text-600)"
        >
          Description
        </Label>

        <Textarea
          id="description"
          name="description"
          placeholder="Optional — additional context for the operator"
          className="input-base resize-none"
          rows={3}
          maxLength={1000}
        />
      </div>

      {/* Property */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="propertyId"
          className="text-xs font-medium text-(--color-text-600)"
        >
          Property <span aria-hidden="true">*</span>
        </Label>

        <Select value={propertyId} onValueChange={setPropertyId}>
          <SelectTrigger id="propertyId" className="input-base w-full">
            <SelectValue placeholder="Select a property" />
          </SelectTrigger>

          <SelectContent>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Assignee — optional */}
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="assignedToId"
          className="text-xs font-medium text-(--color-text-600)"
        >
          Assign to
        </Label>

        <Select value={assignedToId} onValueChange={setAssignedToId}>
          <SelectTrigger id="assignedToId" className="input-base w-full">
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="unassigned">Unassigned</SelectItem>

            {operators.map((op) => (
              <SelectItem key={op.id} value={op.id}>
                {op.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p className="text-xs text-(--color-status-cancelled)">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Creating…" : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
