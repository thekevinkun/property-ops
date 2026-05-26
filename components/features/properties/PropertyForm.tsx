"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createPropertyAction } from "@/actions/property.actions";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const PropertyForm = () => {
  const router = useRouter();

  const [pending, setPending] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setPending(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const result = await createPropertyAction(formData);

    setPending(false);

    if (!result.success) {
      setError(result.error);
      return;
    }

    router.push("/dashboard/properties");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="name"
          className="text-xs font-medium text-(--color-text-600)"
        >
          Property name <span aria-hidden="true">*</span>
        </Label>

        <Input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Sunset Apartments Unit 4A"
          className="input-base"
          maxLength={100}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label
          htmlFor="address"
          className="text-xs font-medium text-(--color-text-600)"
        >
          Address <span aria-hidden="true">*</span>
        </Label>

        <Input
          id="address"
          name="address"
          type="text"
          required
          placeholder="e.g. 12 Maple Street, London, SW1A 1AA"
          className="input-base"
          maxLength={200}
        />
      </div>

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
          placeholder="Optional — any notes about this property"
          className="input-base resize-none"
          rows={3}
          maxLength={500}
        />
      </div>

      {error && (
        <p className="text-xs text-(--color-status-cancelled)">{error}</p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Creating…" : "Create Property"}
        </Button>
      </div>
    </form>
  );
};

export default PropertyForm;
