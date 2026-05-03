import type { Metadata } from "next";
import Link from "next/link";
import { createExpense, deleteExpense, updateExpense } from "@/app/admin/expenses/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { requireRole } from "@/lib/auth/guards";
import { superAdminRoles } from "@/lib/auth/roles";
import { expenseCategoryOptions, formatEnumLabel, formatPkr, paymentMethodOptions } from "@/lib/check-in/options";

export const metadata: Metadata = {
  title: "Expenses",
};

type PageProps = {
  searchParams: Promise<{ message?: string }>;
};

export default async function ExpensesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase } = await requireRole(superAdminRoles);
  const [{ data: expenses, error }, { data: rooms }, { data: maintenanceLinks }] = await Promise.all([
    supabase.from("expenses").select("*").order("expense_date", { ascending: false }),
    supabase.from("rooms").select("id,name").order("name"),
    supabase.from("room_maintenance_logs").select("linked_expense_id,issue_title").not("linked_expense_id", "is", null),
  ]);
  const roomNames = new Map((rooms ?? []).map((room) => [room.id, room.name]));
  const maintenanceExpenseTitles = new Map((maintenanceLinks ?? []).map((log) => [log.linked_expense_id, log.issue_title]));

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-xl border border-brand-sage bg-white/85 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-brand-fresh">Operations</p>
            <h1 className="mt-1 font-serif text-3xl font-semibold text-brand-deep">Expenses</h1>
            <p className="mt-2 text-sm text-slate-600">Owner-level expense tracker using the existing expenses table.</p>
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
            <CardTitle>Add expense</CardTitle>
            <CardDescription>Receipt upload is optional and stored in the private expense receipts bucket.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createExpense} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select id="category" name="category" required>
                  {expenseCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount_pkr">Amount PKR</Label>
                <Input id="amount_pkr" name="amount_pkr" type="number" min={0} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense_date">Date</Label>
                <Input id="expense_date" name="expense_date" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid_to">Paid to</Label>
                <Input id="paid_to" name="paid_to" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment_method">Payment method</Label>
                <Select id="payment_method" name="payment_method" required>
                  {paymentMethodOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="related_room_id">Related room</Label>
                <Select id="related_room_id" name="related_room_id">
                  <option value="">No room</option>
                  {(rooms ?? []).map((room) => (
                    <option key={room.id} value={room.id}>{room.name}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="receipt">Receipt upload</Label>
                <Input id="receipt" name="receipt" type="file" accept=".jpg,.jpeg,.png,.pdf" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" name="notes" />
              </div>
              <div className="flex items-end">
                <Button type="submit">Add expense</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Expense list</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <p className="text-sm text-red-700">{error.message}</p>
            ) : !expenses?.length ? (
              <p className="text-sm text-slate-600">No expenses recorded yet.</p>
            ) : (
              expenses.map((expense) => (
                <form key={expense.id} action={updateExpense} className="rounded-lg border border-brand-sage bg-white p-4">
                  <input type="hidden" name="id" value={expense.id} />
                  <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="font-semibold text-brand-deep">{formatEnumLabel(expense.category)}</h2>
                      <p className="text-sm text-slate-600">
                        {expense.expense_date} - {expense.paid_to} - {formatPkr(expense.amount_pkr)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {maintenanceExpenseTitles.has(expense.id) ? <Badge tone="success">Maintenance linked</Badge> : null}
                      {expense.receipt_file_path ? <Badge tone="info">Receipt stored</Badge> : <Badge>No receipt</Badge>}
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <Select name="category" defaultValue={expense.category} aria-label="Category">
                      {expenseCategoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    <Input name="amount_pkr" type="number" min={0} defaultValue={expense.amount_pkr} aria-label="Amount PKR" />
                    <Input name="expense_date" type="date" defaultValue={expense.expense_date} aria-label="Expense date" />
                    <Input name="paid_to" defaultValue={expense.paid_to} aria-label="Paid to" />
                    <Select name="payment_method" defaultValue={expense.payment_method} aria-label="Payment method">
                      {paymentMethodOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                    <Select name="related_room_id" defaultValue={expense.related_room_id ?? ""} aria-label="Related room">
                      <option value="">No room</option>
                      {(rooms ?? []).map((room) => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </Select>
                    <Input name="receipt" type="file" accept=".jpg,.jpeg,.png,.pdf" aria-label="Replace receipt" />
                    <Textarea name="notes" defaultValue={expense.notes ?? ""} aria-label="Notes" />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Room: {expense.related_room_id ? roomNames.get(expense.related_room_id) ?? "Assigned room" : "None"}
                    {maintenanceExpenseTitles.has(expense.id) ? ` - Linked maintenance: ${maintenanceExpenseTitles.get(expense.id)}` : ""}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="submit" size="sm">Save</Button>
                    <Button
                      type="submit"
                      size="sm"
                      variant="outline"
                      formAction={deleteExpense}
                    >
                      Delete
                    </Button>
                  </div>
                </form>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
