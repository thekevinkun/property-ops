import { TaskForm } from "@/components/features/tasks";

type Property = { id: string; name: string };
type Operator = { id: string; name: string; email: string };

type Props = {
  propertyId?: string | undefined;
  properties: Property[];
  operators: Operator[];
};

const TaskNewSection = ({ propertyId, properties, operators }: Props) => {
  return (
    <div>
      <div className="page-header">
        <h1 className="text-xl font-semibold text-(--color-text-900)">
          Create Task
        </h1>
        <p className="text-sm mt-0.5 text-(--color-text-600)">
          Assign a new work order to a property and operator
        </p>
      </div>

      <div className="page-content">
        <div className="max-w-xl mx-auto">
          <div className="card-base p-6">
            <TaskForm
              properties={properties}
              operators={operators}
              defaultPropertyId={propertyId}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskNewSection;
