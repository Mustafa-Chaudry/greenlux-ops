import Link from "next/link";
import { signIn } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignInForm({ message }: { message?: string }) {
  return (
    <Card className="border-brand-sage bg-white/90 shadow-soft">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Access your GreenLux guest profile or management dashboard.</CardDescription>
      </CardHeader>
      <form action={signIn}>
        <CardContent className="space-y-4">
          {message ? (
            <p className="rounded-lg border border-brand-sage bg-brand-ivory px-3 py-2 text-sm text-brand-deep">
              {message}
            </p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full">Sign in</Button>
          <p className="text-center text-sm text-slate-600">
            New guest?{" "}
            <Link href="/auth/sign-up" className="font-medium text-brand-fresh">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

