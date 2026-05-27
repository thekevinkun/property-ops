import { Role } from "@prisma/client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PropertyCard, PropertyForm } from "@/components/features/properties";

import { PropertyWithMeta } from "@/types";

type Props = {
  properties: PropertyWithMeta[];
  userRole: Role;
};

const PropertiesSection = ({ properties, userRole }: Props) => {
  const isAdmin = userRole === Role.ADMIN;

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-(--color-text-900)">
              Properties
            </h1>

            <p className="text-sm mt-0.5 text-(--color-text-600)">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"}
              {isAdmin ? " across the platform" : " in your portfolio"}
            </p>
          </div>

          {/* Create button — Admin only */}
          {isAdmin && (
            <Dialog>
              <DialogTrigger className="btn-primary">
                Add Property
              </DialogTrigger>

              <DialogContent
                aria-describedby={undefined}
                className="card-base sm:max-w-md"
              >
                <DialogHeader>
                  <DialogTitle className="text-sm font-medium text-(--color-text-900)">
                    New Property
                  </DialogTitle>
                </DialogHeader>

                <PropertyForm />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="page-content">
        {properties.length === 0 ? (
          <Card className="card-base p-0">
            <CardContent className="p-10 text-center text-(--color-text-400)">
              <p className="text-sm">No properties yet.</p>

              {isAdmin && (
                <p className="text-xs mt-1">
                  Use "Add Property" to create the first one.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          // Responsive grid — 1 column on mobile, 2 on md, 3 on xl
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesSection;
