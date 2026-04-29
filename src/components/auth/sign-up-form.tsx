import Link from "next/link";
import { signUp } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm({ message }: { message?: string }) {
  return (
    <Card className="border-brand-sage bg-white/90 shadow-soft">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Start a secure guest profile for check-in and stay records.</CardDescription>
      </CardHeader>
      <form action={signUp}>
        <CardContent className="space-y-4">
          {message ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full name</Label>
            <Input id="fullName" name="fullName" autoComplete="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile / WhatsApp</Label>
            <Input id="phone" name="phone" autoComplete="tel" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <Button type="submit" className="w-full">Create account</Button>
          <p className="text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-brand-fresh">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}

