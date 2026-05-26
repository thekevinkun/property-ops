import { Role, TaskStatus } from "@prisma/client";

// Maps every valid transition to the roles permitted to perform it.
// Terminal states (DONE, CANCELLED) have no outgoing entries — no code path can leave them.
// To add a new status or rule, change exactly this map and nothing else.
const TRANSITIONS: Record<TaskStatus, Partial<Record<TaskStatus, Role[]>>> = {
  PENDING: {
    IN_PROGRESS: [Role.OPERATOR, Role.ADMIN],
    CANCELLED: [Role.ADMIN],
  },
  IN_PROGRESS: {
    DONE: [Role.OPERATOR, Role.ADMIN],
    CANCELLED: [Role.ADMIN],
  },
  // Terminal — intentionally empty so getValidTransitions returns []
  DONE: {},
  CANCELLED: {},
};

// Returns true if this role may move a task from currentStatus to newStatus.
// Used in the service layer before every status write.
export function canTransition(
  role: Role,
  currentStatus: TaskStatus,
  newStatus: TaskStatus,
): boolean {
  const allowedRoles = TRANSITIONS[currentStatus]?.[newStatus];
  return allowedRoles?.includes(role) ?? false;
}

// Returns the list of statuses this role can move a task to from currentStatus.
// Used by TaskTransitionButton to decide which buttons to render — avoids
// duplicating permission logic in UI code.
export function getValidTransitions(
  role: Role,
  currentStatus: TaskStatus,
): TaskStatus[] {
  const transitions = TRANSITIONS[currentStatus] ?? {};
  return (Object.entries(transitions) as [TaskStatus, Role[]][])
    .filter(([, roles]) => roles.includes(role))
    .map(([status]) => status);
}
