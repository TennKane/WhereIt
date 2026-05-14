"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createLocation } from "@/lib/actions/location";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LocationCreateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createLocation, {
    success: false,
    fieldErrors: {},
  } as const);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "创建成功");
      router.push("/locations");
    }
  }, [state.success, state.message, router]);

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          场所名称
        </label>
        <Input
          id="name"
          name="name"
          placeholder="例如：家、公司、租房"
          required
          autoFocus
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "创建中..." : "创建"}
      </Button>
    </form>
  );
}
