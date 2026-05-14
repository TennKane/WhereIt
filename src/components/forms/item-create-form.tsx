"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createItem } from "@/lib/actions/item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ItemCreateForm({
  storageId,
  zoneId,
  locationId,
  layerCount,
  onSuccess,
}: {
  storageId: string;
  zoneId: string;
  locationId: string;
  layerCount: number;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(createItem, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? "添加成功");
      if (onSuccess) onSuccess();
      else router.push(`/locations/${locationId}/zones/${zoneId}/storages/${storageId}`);
    }
  }, [state, onSuccess, router, locationId, zoneId, storageId]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="storageId" value={storageId} />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          物品名称
        </label>
        <Input
          id="name"
          name="name"
          placeholder="例如：电视遥控器"
          required
          autoFocus
        />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {layerCount > 1 && (
        <div>
          <label htmlFor="layerIndex" className="mb-1.5 block text-sm font-medium">
            存放层
          </label>
          <select
            id="layerIndex"
            name="layerIndex"
            className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
          >
            {Array.from({ length: layerCount }, (_, i) => (
              <option key={i} value={i}>
                第 {i + 1} 层
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium">
          数量
        </label>
        <Input id="quantity" name="quantity" type="number" min={1} defaultValue={1} />
        {state?.fieldErrors?.quantity && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.quantity[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
          备注（可选）
        </label>
        <Input id="description" name="description" placeholder="颜色、品牌等" />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "添加中..." : "添加"}
      </Button>
    </form>
  );
}
