"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, GripVertical } from "lucide-react";
import { createStorage, updateStorage } from "@/lib/actions/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RowDef { name: string }
interface ShelfDef { name: string; rows: RowDef[] }

function parseShelves(raw: string | null): ShelfDef[] {
  try { return JSON.parse(raw ?? "[]"); } catch { return [{ name: "第一层", rows: [{ name: "第一格" }] }]; }
}

export function StorageCreateForm({
  zoneId,
  locationId,
  storageId,
  defaultShelves,
  defaultName,
  defaultDescription,
  onSuccess,
}: {
  zoneId: string;
  locationId: string;
  storageId?: string;
  defaultShelves?: string;
  defaultName?: string;
  defaultDescription?: string | null;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const isEdit = !!storageId;
  const [shelves, setShelves] = useState<ShelfDef[]>(defaultShelves ? parseShelves(defaultShelves) : [{ name: "第一层", rows: [{ name: "第一格" }] }]);
  const [state, formAction, isPending] = useActionState(isEdit ? updateStorage : createStorage, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message ?? (isEdit ? "已更新" : "创建成功"));
      if (onSuccess) onSuccess();
      else if (!isEdit) router.push(`/locations/${locationId}/zones/${zoneId}`);
    }
  }, [state, onSuccess, router, locationId, zoneId, isEdit]);

  function updateShelf(index: number, name: string) {
    setShelves(shelves.map((s, i) => i === index ? { ...s, name } : s));
  }

  function addRow(shelfIndex: number) {
    setShelves(shelves.map((s, i) => i === shelfIndex
      ? { ...s, rows: [...s.rows, { name: `第${s.rows.length + 1}格` }] }
      : s));
  }

  function removeRow(shelfIndex: number, rowIndex: number) {
    setShelves(shelves.map((s, i) => i === shelfIndex
      ? { ...s, rows: s.rows.filter((_, ri) => ri !== rowIndex) }
      : s));
  }

  function updateRowName(shelfIndex: number, rowIndex: number, name: string) {
    setShelves(shelves.map((s, i) => i === shelfIndex
      ? { ...s, rows: s.rows.map((r, ri) => ri === rowIndex ? { ...r, name } : r) }
      : s));
  }

  function addShelf() {
    setShelves([...shelves, { name: `第${shelves.length + 1}层`, rows: [{ name: "第一格" }] }]);
  }

  function removeShelf(index: number) {
    setShelves(shelves.filter((_, i) => i !== index));
  }

  const shelvesJson = JSON.stringify(shelves);

  return (
    <form action={formAction} className="space-y-4">
      {isEdit ? <input type="hidden" name="id" value={storageId} /> : <input type="hidden" name="zoneId" value={zoneId} />}
      <input type="hidden" name="shelves" value={shelvesJson} />

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium">
          储物名称
        </label>
        <Input id="name" name="name" placeholder="例如：茶几、衣柜、书架" required autoFocus defaultValue={defaultName} />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium">层格规格</label>
          <Button type="button" variant="outline" size="sm" onClick={addShelf}>
            <Plus className="size-3" />添加层
          </Button>
        </div>

        <div className="space-y-3">
          {shelves.map((shelf, si) => (
            <div key={si} className="rounded-lg border border-border p-3">
              <div className="mb-2 flex items-center gap-2">
                <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
                <Input
                  value={shelf.name}
                  onChange={(e) => updateShelf(si, e.target.value)}
                  className="h-8 flex-1 text-sm"
                  placeholder="层名称"
                />
                {shelves.length > 1 && (
                  <button type="button" onClick={() => removeShelf(si)} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="size-4" />
                  </button>
                )}
              </div>

              <div className="ml-6 space-y-1.5">
                {shelf.rows.map((row, ri) => (
                  <div key={ri} className="flex items-center gap-2">
                    <Input
                      value={row.name}
                      onChange={(e) => updateRowName(si, ri, e.target.value)}
                      className="h-7 flex-1 text-xs"
                      placeholder="格名称"
                    />
                    {shelf.rows.length > 1 && (
                      <button type="button" onClick={() => removeRow(si, ri)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="size-3" />
                      </button>
                    )}
                  </div>
                ))}
                <Button type="button" variant="ghost" size="sm" onClick={() => addRow(si)} className="h-7 text-xs">
                  <Plus className="size-3" />添加格
                </Button>
              </div>
            </div>
          ))}
        </div>
        {state?.fieldErrors?.shelves && (
          <p className="mt-1 text-sm text-red-500">{state.fieldErrors.shelves[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1.5 block text-sm font-medium">
          备注（可选）
        </label>
        <Input id="description" name="description" placeholder="尺寸、颜色等" defaultValue={defaultDescription ?? ""} />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? "保存中..." : (isEdit ? "保存" : "创建")}
      </Button>
    </form>
  );
}
