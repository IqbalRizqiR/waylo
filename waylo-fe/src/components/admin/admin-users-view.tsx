"use client";

import {useTranslations} from "next-intl";
import {useApiQuery, useApiMutation} from "@/lib/query/hooks";
import {queryKeys} from "@/lib/query/keys";
import type {AdminUserItem, UpdateUserRoleInput} from "@waylo/shared";
import {Card} from "@/components/ui/card";
import {Chip} from "@/components/ui/chip";
import {Select} from "@/components/shared/select";
import {PageHeader} from "@/components/shared/page-header";
import {DataState} from "@/components/shared/data-state";
import {formatLongDate} from "@/lib/format";

export function AdminUsersView() {
  const t = useTranslations("admin.users");
  const query = useApiQuery<AdminUserItem[]>(
    queryKeys.admin.users,
    "/admin/users",
  );

  const updateRoleMutation = useApiMutation<
    unknown,
    {userId: string; role: UpdateUserRoleInput["role"]}
  >({
    invalidateKeys: [queryKeys.admin.users, queryKeys.admin.dashboard],
    mapVariables: ({userId, role}) => ({
      path: `/admin/users/${userId}/role`,
      method: "PATCH",
      body: {role},
    }),
  });

  const roleOptions = [
    {value: "learner", label: t("role.learner")},
    {value: "mentor", label: t("role.mentor")},
    {value: "company_member", label: t("role.company_member")},
    {value: "admin", label: t("role.admin")},
  ];

  return (
    <DataState
      query={query}
      data={query.data}
      isEmpty={(data) => data.length === 0}
      emptyTitle={t("emptyTitle")}
      emptyBody={t("emptyBody")}
    >
      {(users) => (
        <div className="flex flex-col gap-8">
          <PageHeader title={t("title")} subtitle={t("subtitle")} />

          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs text-[var(--muted-foreground)]">
                    <th className="pb-3 font-medium">{t("colName")}</th>
                    <th className="pb-3 font-medium">{t("colEmail")}</th>
                    <th className="pb-3 font-medium">{t("colRole")}</th>
                    <th className="pb-3 font-medium">{t("colJoined")}</th>
                    <th className="pb-3 text-right font-medium">{t("colChangeRole")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="py-3">
                      <td className="py-3.5 pr-4 font-medium text-black">
                        {user.fullName}
                      </td>
                      <td className="py-3.5 pr-4 text-[var(--text-secondary)]">
                        {user.email}
                      </td>
                      <td className="py-3.5 pr-4">
                        <Chip
                          tone={
                            user.role === "admin"
                              ? "status"
                              : user.role === "mentor"
                              ? "skill"
                              : user.role === "company_member"
                              ? "success"
                              : "muted"
                          }
                          className="capitalize"
                        >
                          {t(`role.${user.role}`)}
                        </Chip>
                      </td>
                      <td className="py-3.5 pr-4 text-xs text-[var(--muted-foreground)]">
                        {formatLongDate(user.createdAt)}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-block w-40 text-left">
                          <Select
                            value={user.role}
                            onChange={(val) =>
                              void updateRoleMutation.mutateAsync({
                                userId: user.id,
                                role: val as UpdateUserRoleInput["role"],
                              })
                            }
                            options={roleOptions}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}
    </DataState>
  );
}
