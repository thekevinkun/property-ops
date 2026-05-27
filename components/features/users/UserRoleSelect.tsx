"use client";

import { useState } from "react";
import { Role } from "@prisma/client";

import { changeUserRoleAction } from "@/actions/user.actions";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ROLE_OPTIONS } from "@/helpers/status";

type Props = {
  userId: string;
  currentRole: Role;
};

const UserRoleSelect = ({ userId, currentRole }: Props) => {
  const [selected, setSelected] = useState<Role>(currentRole);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const isDirty = selected !== currentRole;

  const handleSave = async () => {
    setPending(true);
    setError(null);
    setSaved(false);

    try {
      const result = await changeUserRoleAction(userId, selected);

      if (result.error) {
        setError(result.error);
        // Reset select back to current role on failure
        setSelected(currentRole);
      } else {
        setSaved(true);
        // Clear saved indicator after 2 seconds
        setTimeout(() => setSaved(false), 2000);
      }
    } catch {
      setError("Unable to update role. Please try again.");
      setSelected(currentRole);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <Select
          value={selected}
          onValueChange={(val) => {
            setSelected(val as Role);
            setError(null);
            setSaved(false);
          }}
          disabled={pending}
        >
          <SelectTrigger className="input-base w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {ROLE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Save button only appears when selection differs from current role */}
        {isDirty && (
          <Button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="btn-primary h-8 text-xs px-3"
          >
            {pending ? "Saving…" : "Save"}
          </Button>
        )}

        {/* Inline confirmation — no toast library needed */}
        {saved && !isDirty && (
          <span className="text-xs text-(--color-status-done)">Saved</span>
        )}
      </div>

      {error && (
        <p className="text-xs text-(--color-status-cancelled)">{error}</p>
      )}
    </div>
  );
};

export default UserRoleSelect;
