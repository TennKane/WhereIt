"use client";

import { useActionState } from "react";
import { register } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(register, {
    success: false,
    fieldErrors: {},
  } as const);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
          邮箱
        </label>
        <Input id="email" name="email" type="email" placeholder="your@email.com" required autoFocus />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
          密码
        </label>
        <Input id="password" name="password" type="password" placeholder="至少 6 位" required minLength={6} />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "注册中..." : "注册"}
      </Button>
    </form>
  );
}
