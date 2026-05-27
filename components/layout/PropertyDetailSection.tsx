import Link from "next/link";

import { Role } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/features/tasks";
import { PropertyDeleteButton } from "@/components/features/properties";

import { PropertyDetail } from "@/types";

type Props = {
  property: PropertyDetail;
  userRole: Role;
};

const PropertyDetailSection = ({ property, userRole }: Props) => {
  const isAdmin = userRole === Role.ADMIN;

  // Group tasks by status for the summary counts
  const counts = {
    pending: property.tasks.filter((t) => t.status === "PENDING").length,

    inProgress: property.tasks.filter((t) => t.status === "IN_PROGRESS").length,

    done: property.tasks.filter((t) => t.status === "DONE").length,
  };

  return (
    <div>
      <div className="page-header">
        {/* Breadcrumb */}
        <div className="flex justify-between gap-1.5 mb-5">
          <div className="flex items-center gap-1.5 text-xs text-(--color-text-400)">
            <Link
              href="/dashboard/properties"
              className="text-(--color-text-600) hover:underline"
            >
              Properties
            </Link>

            <span>/</span>

            <span>{property.name}</span>
          </div>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <PropertyDeleteButton
                propertyId={property.id}
                propertyName={property.name}
                taskCount={property.tasks.length}
              />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl text-(--color-text-900) font-semibold">
              {property.name}
            </h1>

            <p className="text-sm text-(--color-text-600) mt-0.5">
              {property.address}
            </p>
          </div>

          {/* Task summary counts */}
          <div className="flex items-center gap-3 text-xs text-(--color-text-400) shrink-0">
            <span>{counts.pending} pending</span>

            <span className="text-(--color-border)">·</span>

            <span>{counts.inProgress} in progress</span>

            <span className="text-(--color-border)">·</span>

            <span>{counts.done} done</span>
          </div>
        </div>

        {property.description && (
          <p className="text-sm mt-2 text-(--color-text-600)">
            {property.description}
          </p>
        )}
      </div>

      <div className="page-content">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-(--color-text-900)">
            Tasks ({property.tasks.length})
          </h2>

          {/* Admin actions */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="btn-secondary text-xs"
              >
                <Link href={`/dashboard/tasks/new?propertyId=${property.id}`}>
                  Add Task
                </Link>
              </Button>
            </div>
          )}
        </div>

        {property.tasks.length === 0 ? (
          <Card className="card-base p-0">
            <CardContent className="p-8 text-center text-(--color-text-400)">
              <p className="text-sm">No tasks on this property yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {property.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertyDetailSection;
