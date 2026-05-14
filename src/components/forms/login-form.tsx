"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(login, {
    success: false,
    fieldErrors: {},
  } as const);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "登录成功");
      router.push("/");
    }
  }, [state.success, state.message, router]);

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
        <Input id="password" name="password" type="password" placeholder="密码" required />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "登录中..." : "登录"}
      </Button>
    </form>
  );
}
