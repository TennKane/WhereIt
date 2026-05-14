"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createStorage } from "@/lib/actions/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function StorageCreateForm({
  zoneId,
  locationId,
}: {
  zoneId: string;
  locationId: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createStorage, {
    success: false,
    fieldErrors: {},
  } as const);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "创建成功");
      router.push(`/locations/${locationId}/zones/${zoneId}`);
    }
  }, [state.success, state.message, router, locationId, zoneId]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="zoneId" value={zoneId} />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          储物名称
        </label>
        <Input
          id="name"
          name="name"
          placeholder="例如：茶几、衣柜、书架"
          required
          autoFocus
        />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="layers" className="mb-1.5 block text-sm font-medium">
          层数
        </label>
        <Input
          id="layers"
          name="layers"
          type="number"
          min={1}
          max={20}
          defaultValue={1}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          设置 1 表示无分层，大于 1 会显示对应的层
        </p>
        {state.fieldErrors?.layers && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.layers[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
          备注（可选）
        </label>
        <Input id="description" name="description" placeholder="尺寸、颜色等" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "创建中..." : "创建"}
      </Button>
    </form>
  );
}
