"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Package, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/ui/modal";
import { ItemCreateForm, type ShelfData } from "@/components/forms/item-create-form";
import { ItemEditForm } from "@/components/forms/item-edit-form";
import { StorageCreateForm } from "@/components/forms/storage-create-form";
import { deleteItem } from "@/lib/actions/item";

interface Item {
  id: string;
  name: string;
  description: string | null;
  quantity: number | null;
  shelfIndex: number | null;
  rowIndex: number | null;
}

interface Props {
  locationId: string;
  locationName: string;
  zoneId: string;
  zoneName: string;
  storageId: string;
  storageName: string;
  storageDescription: string | null;
  shelves: ShelfData[];
  shelvesRaw: string;
  itemsByShelfRow: Record<string, Item[]>; // key: "shelfIndex-rowIndex"
}

export function StorageDetailClient({
  locationId, locationName, zoneId, zoneName,
  storageId, storageName, storageDescription,
  shelves, shelvesRaw, itemsByShelfRow,
}: Props) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const allItems = Object.values(itemsByShelfRow).flat();
  const hasItems = allItems.length > 0;

  // Group items by shelf then row
  const shelfDisplay = shelves.map((shelf, si) => {
    const rows = shelf.rows.map((row, ri) => {
      const items = itemsByShelfRow[`${si}-${ri}`] ?? [];
      return { ...row, rowIndex: ri, items };
    });
    return { ...shelf, shelfIndex: si, rows };
  });

  if (!hasItems) {
    return (
      <div>
        <Link
          href={`/locations/${locationId}/zones/${zoneId}`}
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {locationName} → {zoneName}
        </Link>

        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{storageName}</h1>
              <p className="text-sm text-muted-foreground">
                {locationName} → {zoneName} → {storageName}
              </p>
              {storageDescription && (
                <p className="text-xs text-muted-foreground mt-1">{storageDescription}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
                <Pencil className="size-4" />
              </Button>
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                添加物品
              </Button>
            </div>
          </div>
        </div>

        <EmptyState
          title="还没有物品"
          description="开始往里面放东西吧"
          actionLabel="添加物品"
          onAction={() => setOpen(true)}
        />

        <Modal open={open} onClose={() => setOpen(false)} title="添加物品">
          <ItemCreateForm
            storageId={storageId}
            zoneId={zoneId}
            locationId={locationId}
            shelves={shelves}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <Link
        href={`/locations/${locationId}/zones/${zoneId}`}
        className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {locationName} → {zoneName}
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{storageName}</h1>
            <p className="text-sm text-muted-foreground">
              {locationName} → {zoneName} → {storageName}
            </p>
            {storageDescription && (
              <p className="text-xs text-muted-foreground mt-1">{storageDescription}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setEditOpen(true)}>
              <Pencil className="size-4" />
            </Button>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              添加物品
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {shelfDisplay.map((shelf) => {
          const hasAnyItems = shelf.rows.some(r => r.items.length > 0);
          if (!hasAnyItems) return null;

          return (
            <div key={shelf.shelfIndex}>
              <h2 className="mb-3 text-sm font-medium text-foreground">
                {shelf.name}
              </h2>
              <div className="space-y-3">
                {shelf.rows.map((row) => {
                  if (row.items.length === 0) return null;
                  return (
                    <div key={row.rowIndex}>
                      <h3 className="mb-1.5 text-xs text-muted-foreground ml-1">
                        {row.name}
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {row.items.map((item) => (
                          <Card key={item.id} className="relative">
                            <CardHeader className="flex-row items-start gap-3 space-y-0 pr-8">
                              <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                              <div>
                                <CardTitle className="text-sm">
                                  {item.name}
                                  {(item.quantity ?? 1) > 1 && (
                                    <Badge variant="secondary" className="ml-2 text-xs">
                                      x{item.quantity}
                                    </Badge>
                                  )}
                                </CardTitle>
                                {item.description && (
                                  <p className="mt-0.5 text-xs text-muted-foreground">
                                    {item.description}
                                  </p>
                                )}
                              </div>
                            </CardHeader>
                            <div className="flex gap-1 absolute right-2 top-2">
                              <Button variant="ghost" size="icon" className="size-7" onClick={() => setEditingItem(item)}>
                                <span className="text-xs text-muted-foreground">✎</span>
                              </Button>
                              <form action={deleteItem.bind(null, item.id)}>
                                <Button variant="ghost" size="icon" type="submit" className="size-7">
                                  <Trash2 className="size-3 text-muted-foreground" />
                                </Button>
                              </form>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="添加物品">
        <ItemCreateForm
          storageId={storageId}
          zoneId={zoneId}
          locationId={locationId}
          shelves={shelves}
          onSuccess={() => setOpen(false)}
        />
      </Modal>

      <Modal open={!!editingItem} onClose={() => setEditingItem(null)} title="编辑物品">
        {editingItem && (
          <ItemEditForm
            itemId={editingItem.id}
            storageId={storageId}
            zoneId={zoneId}
            locationId={locationId}
            shelves={shelves}
            defaultValues={{
              name: editingItem.name,
              quantity: editingItem.quantity ?? 1,
              description: editingItem.description,
              shelfIndex: editingItem.shelfIndex ?? 0,
              rowIndex: editingItem.rowIndex ?? 0,
            }}
            onSuccess={() => setEditingItem(null)}
          />
        )}
      </Modal>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="编辑储物">
        <StorageCreateForm
          zoneId={zoneId}
          locationId={locationId}
          storageId={storageId}
          defaultShelves={shelvesRaw}
          defaultName={storageName}
          defaultDescription={storageDescription}
          onSuccess={() => setEditOpen(false)}
        />
      </Modal>
    </div>
  );
}
