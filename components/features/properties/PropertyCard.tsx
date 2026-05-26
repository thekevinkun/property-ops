import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { PropertyWithMeta } from "@/types/index";

type Props = {
  property: PropertyWithMeta;
};

const PropertyCard = ({ property }: Props) => {
  return (
    <Link href={`/dashboard/properties/${property.id}`} className="block">
      <Card className="card-interactive p-0">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-(--color-text-900)">
                {property.name}
              </p>

              <p className="text-xs text-(--color-text-600) mt-0.5 truncate">
                {property.address}
              </p>
            </div>

            {/* Task count badge — uses neutral styling, not status colors */}
            <Badge
              className="bg-(--color-bg-subtle) border border-(--color-border) text-xs 
                text-(--color-text-600) font-medium px-2 py-0.5 rounded shrink-0"
            >
              {property._count.tasks} task
              {property._count.tasks !== 1 ? "s" : ""}
            </Badge>
          </div>

          {property.description && (
            <p className="text-xs text-(--color-text-600) mt-2 line-clamp-2">
              {property.description}
            </p>
          )}

          <p className="text-xs text-(--color-text-400) mt-3">
            Added by {property.createdBy.name}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};

export default PropertyCard;
