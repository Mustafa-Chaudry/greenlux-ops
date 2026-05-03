import type { Metadata } from "next";
import Link from "next/link";
import { createStaffUser, updateUserRole } from "@/app/admin/users/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { requireRole } from "@/lib/auth/guards";
import { userRoles, superAdminRoles } from "@/lib/auth/roles";
import { formatEnumLabel } from "@/lib/check-in/options";

export const metadata: Metadata = {
  title: "Users and Roles",
};

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

function roleTone(role: string): "neutral" | "success" | "danger" | "info" {
  if (role === "super_admin") {
    return "danger";
  }

  if (role === "admin") {
    return "info";
  }

  if (role === "manager") {
    return "success";
  }

  return "neutral";
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireRole(superAdminRoles);
  const { data: users, error } = await supabase
    .from("users_profile")
    .select("id,full_name,phone,email,role,created_at")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Owner controls</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Users / Roles</h1>
            <p className="mt-2 text-sm text-slate-600">
              Super admin only. Managers can operate guest stays, but cannot access expenses, profit reports, or role management.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/admin">Back to admin</Link>
          </Button>
        </header>

        {params.message ? (
          <div className="rounded-lg border border-brand-sage bg-brand-ivory p-4 text-sm text-brand-deep">{params.message}</div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Create staff user</CardTitle>
            <CardDescription>
              Creates a confirmed Supabase auth user. Share the temporary password privately with the staff member.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createStaffUser} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full name</Label>
                <Input id="full_name" name="full_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone optional</Label>
                <Input id="phone" name="phone" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select id="role" name="role" defaultValue="manager" required>
                  {userRoles.map((role) => (
                    <option key={role} value={role}>
                      {formatEnumLabel(role)}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="temporary_password">Temporary password</Label>
                <Input id="temporary_password" name="temporary_password" type="password" minLength={8} required />
              </div>
              <div className="flex items-end">
                <Button type="submit">Create user</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User list</CardTitle>
            <CardDescription>Change roles carefully. At least one super admin must remain.</CardDescription>
          </CardHeader>
          <CardContent>
            {error ? (
              <p className="text-sm text-red-700">{error.message}</p>
            ) : !users?.length ? (
              <p className="text-sm text-slate-600">No user profiles found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[820px] text-left text-sm">
                  <thead className="border-b border-brand-sage bg-brand-ivory text-xs uppercase tracking-[0.12em] text-brand-deep">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3">Change role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-sage/70">
                    {users.map((user) => (
                      <tr key={user.id} className="bg-white align-top">
                        <td className="px-4 py-3 font-medium text-brand-deep">{user.full_name || "Not provided"}</td>
                        <td className="px-4 py-3">{user.email || "Not provided"}</td>
                        <td className="px-4 py-3">{user.phone || "Not provided"}</td>
                        <td className="px-4 py-3">
                          <Badge tone={roleTone(user.role)}>{formatEnumLabel(user.role)}</Badge>
                        </td>
                        <td className="px-4 py-3">{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3">
                          <form action={updateUserRole} className="flex flex-wrap gap-2">
                            <input type="hidden" name="id" value={user.id} />
                            <Select name="role" defaultValue={user.role} aria-label={`Role for ${user.email || user.id}`} className="h-9 w-36">
                              {userRoles.map((role) => (
                                <option key={role} value={role}>
                                  {formatEnumLabel(role)}
                                </option>
                              ))}
                            </Select>
                            <Button type="submit" size="sm" variant="secondary">
                              Save
                            </Button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
