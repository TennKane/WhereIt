"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/ui/modal";
import { ItemCreateForm } from "@/components/forms/item-create-form";
import { deleteItem } from "@/lib/actions/item";

interface Item {
  id: string;
  storageId: string | null;
  layerIndex: number | null;
  name: string;
  description: string | null;
  quantity: number | null;
  image: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface Props {
  locationId: string;
  locationName: string;
  zoneId: string;
  zoneName: string;
  storageId: string;
  storageName: string;
  storageDescription: string | null;
  layerCount: number;
  layers: number[];
  itemsByLayer: Record<number, Item[]>;
  allItems: Item[];
}

export function StorageDetailClient({
  locationId, locationName, zoneId, zoneName,
  storageId, storageName, storageDescription,
  layerCount, layers, itemsByLayer, allItems,
}: Props) {
  const [open, setOpen] = useState(false);

  if (allItems.length === 0) {
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
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              添加物品
            </Button>
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
            layerCount={layerCount}
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
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            添加物品
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {layers.map((layerIndex) => {
          const layerItems = itemsByLayer[layerIndex] ?? [];
          if (layerItems.length === 0) return null;

          return (
            <div key={layerIndex}>
              <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                {layerIndex >= 0 ? `第 ${layerIndex + 1} 层` : "桌面"}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {layerItems.map((item) => (
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
                      <Button variant="ghost" size="icon" asChild className="size-7">
                        <Link href={`/items/${item.id}/edit`}>
                          <span className="text-xs text-muted-foreground">✎</span>
                        </Link>
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

      <Modal open={open} onClose={() => setOpen(false)} title="添加物品">
        <ItemCreateForm
          storageId={storageId}
          zoneId={zoneId}
          locationId={locationId}
          layerCount={layerCount}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
