"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AuditAction } from "@prisma/client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AUDIT_ACTION_CONFIG, ENTITY_TYPE_OPTIONS } from "@/helpers/audit";
import { UserWithRole } from "@/services/user.service";

type Props = {
  users: UserWithRole[];
  action: string;
  entityType: string;
  userId: string;
};

const AuditLogFilters = ({ users, action, entityType, userId }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Updates a single filter param while preserving all other active params
  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`/dashboard/audit?${params.toString()}`);
  };

  const actionOptions = [
    { label: "All Actions", value: "all" },
    ...Object.values(AuditAction).map((a) => ({
      label: AUDIT_ACTION_CONFIG[a].label,
      value: a,
    })),
  ];

  const userOptions = [
    { label: "All Users", value: "all" },
    ...users.map((u) => ({ label: u.name, value: u.id })),
  ];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Action filter */}
      <Select
        value={action}
        onValueChange={(val) => updateFilter("action", val)}
      >
        <SelectTrigger className="input-base w-44 h-9">
          <SelectValue placeholder="All Actions" />
        </SelectTrigger>
        <SelectContent>
          {actionOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Entity type filter */}
      <Select
        value={entityType}
        onValueChange={(val) => updateFilter("entityType", val)}
      >
        <SelectTrigger className="input-base w-44 h-9">
          <SelectValue placeholder="All Entities" />
        </SelectTrigger>
        <SelectContent>
          {ENTITY_TYPE_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* User filter */}
      <Select
        value={userId}
        onValueChange={(val) => updateFilter("userId", val)}
      >
        <SelectTrigger className="input-base w-44 h-9">
          <SelectValue placeholder="All Users" />
        </SelectTrigger>
        <SelectContent>
          {userOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default AuditLogFilters;
