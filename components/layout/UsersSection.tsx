import { UserWithRole } from "@/services/user.service";

import { Card, CardContent } from "@/components/ui/card";
import { UserRoleSelect } from "@/components/features/users";

import { formatDate } from "@/helpers/format";
import { ROLE_BADGE } from "@/helpers/status";

type Props = {
  users: UserWithRole[];
  currentUserId: string;
};

const UsersSection = ({ users, currentUserId }: Props) => {
  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-(--color-text-900)">
              Users
            </h1>
            <p className="text-sm mt-0.5 text-(--color-text-600)">
              {users.length} account{users.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="page-content">
        {users.length === 0 ? (
          <Card className="card-base p-0">
            <CardContent className="p-10 text-center">
              <p className="text-sm text-(--color-text-400)">No users found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="card-base overflow-hidden overflow-x-auto">
            <table className="table-base">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Change Role</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  // Admin cannot change their own role — UI reflects this
                  const isSelf = user.id === currentUserId;

                  return (
                    <tr key={user.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">
                            {user.name}
                          </span>
                          {isSelf && (
                            <span className="text-xs text-(--color-text-400)">
                              (you)
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="text-sm text-(--color-text-600)">
                          {user.email}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-base ${ROLE_BADGE[user.role]}`}>
                          {user.role.charAt(0) +
                            user.role.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td>
                        {isSelf ? (
                          <span className="text-xs text-(--color-text-400)">
                            Cannot change own role
                          </span>
                        ) : (
                          <UserRoleSelect
                            userId={user.id}
                            currentRole={user.role}
                          />
                        )}
                      </td>
                      <td>
                        <span className="text-xs font-mono text-(--color-text-600)">
                          {formatDate(user.createdAt)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersSection;
