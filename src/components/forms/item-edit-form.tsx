"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateItem } from "@/lib/actions/item";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ShelfData } from "./item-create-form";

export function ItemEditForm({
  itemId,
  storageId,
  zoneId,
  locationId,
  shelves,
  defaultValues,
  onSuccess,
}: {
  itemId: string;
  storageId: string;
  zoneId: string;
  locationId: string;
  shelves: ShelfData[];
  defaultValues: {
    name: string;
    quantity: number;
    description: string | null;
    shelfIndex: number;
    rowIndex: number;
  };
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [shelfIndex, setShelfIndex] = useState(defaultValues.shelfIndex);
  const [state, formAction, isPending] = useActionState(
    updateItem.bind(null, itemId),
    { success: false, fieldErrors: {} } as const,
  );

  const currentShelf = shelves[shelfIndex];
  const rowCount = currentShelf?.rows.length ?? 1;

  useEffect(() => {
    if (state.success) {
      toast.success(state.message ?? "保存成功");
      if (onSuccess) onSuccess();
      else router.push(`/locations/${locationId}/zones/${zoneId}/storages/${storageId}`);
    }
  }, [state.success, state.message, onSuccess, router, locationId, zoneId, storageId]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="storageId" value={storageId} />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          物品名称
        </label>
        <Input id="name" name="name" defaultValue={defaultValues.name} required />
        {state.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {shelves.length > 0 && (
        <div>
          <label className="mb-1.5 block text-sm font-medium">存放位置</label>
          <div className="flex gap-2">
            <select
              name="shelfIndex"
              value={shelfIndex}
              onChange={(e) => setShelfIndex(Number(e.target.value))}
              className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
            >
              {shelves.map((s, i) => (
                <option key={i} value={i}>{s.name}</option>
              ))}
            </select>
            {rowCount > 1 && (
              <select
                name="rowIndex"
                defaultValue={defaultValues.rowIndex}
                className="flex-1 rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
              >
                {currentShelf.rows.map((r, i) => (
                  <option key={i} value={i}>{r.name}</option>
                ))}
              </select>
            )}
            {rowCount <= 1 && <input type="hidden" name="rowIndex" value={defaultValues.rowIndex} />}
          </div>
        </div>
      )}
      {shelves.length <= 1 && <input type="hidden" name="shelfIndex" value={defaultValues.shelfIndex} />}

      <div>
        <label htmlFor="quantity" className="mb-1.5 block text-sm font-medium">
          数量
        </label>
        <Input
          id="quantity"
          name="quantity"
          type="number"
          min={1}
          defaultValue={defaultValues.quantity}
        />
        {state.fieldErrors?.quantity && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.quantity[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
          备注
        </label>
        <Input
          id="description"
          name="description"
          defaultValue={defaultValues.description ?? ""}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "保存中..." : "保存"}
      </Button>
    </form>
  );
}
