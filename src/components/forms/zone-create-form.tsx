"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createZone } from "@/lib/actions/zone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ZoneCreateForm({ locationId, onSuccess }: { locationId: string; onSuccess?: () => void }) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createZone, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "创建成功");
      if (onSuccess) onSuccess();
      else router.push(`/locations/${locationId}`);
    }
  }, [state, onSuccess, router, locationId]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locationId" value={locationId} />
      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          区域名称
        </label>
        <Input
          id="name"
          name="name"
          placeholder="例如：客厅、卧室、工位"
          required
          autoFocus
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "创建中..." : "创建"}
      </Button>
    </form>
  );
}
