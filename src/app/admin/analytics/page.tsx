import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireRole } from "@/lib/auth/guards";

export default async function AdminAnalyticsPage() {
  await requireRole(["super_admin"]);

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Button asChild variant="ghost">
          <Link href="/admin">Back to admin</Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Super admin analytics foundation</CardTitle>
            <CardDescription>
              The route is protected for business-owner access. Revenue, occupancy, expense, profitability, and
              decision insight charts will be implemented in the management phase.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </main>
  );
}

