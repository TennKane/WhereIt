"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Box, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/ui/modal";
import { StorageCreateForm } from "@/components/forms/storage-create-form";
import { deleteStorage } from "@/lib/actions/storage";

interface StorageItem {
  id: string;
  name: string;
  shelves: string | null;
  description: string | null;
  itemCount: number;
}

interface Props {
  locationId: string;
  locationName: string;
  zoneId: string;
  zoneName: string;
  storages: StorageItem[];
}

export function ZoneDetailClient({ locationId, locationName, zoneId, zoneName, storages }: Props) {
  const [open, setOpen] = useState(false);

  if (storages.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href={`/locations/${locationId}`}
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            ← {locationName}
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{zoneName}</h1>
              <p className="text-sm text-muted-foreground">
                {locationName} → {zoneName}
              </p>
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              添加储物
            </Button>
          </div>
        </div>
        <EmptyState
          title="这个区域还没有储物"
          description="添加茶几、衣柜、书架等"
          actionLabel="添加储物"
          onAction={() => setOpen(true)}
        />
        <Modal open={open} onClose={() => setOpen(false)} title="添加储物">
          <StorageCreateForm
            zoneId={zoneId}
            locationId={locationId}
            onSuccess={() => setOpen(false)}
          />
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/locations/${locationId}`}
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← {locationName}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{zoneName}</h1>
            <p className="text-sm text-muted-foreground">
              {locationName} → {zoneName}
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" />
            添加储物
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {storages.map((s) => (
          <Link key={s.id} href={`/locations/${locationId}/zones/${zoneId}/storages/${s.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Box className="size-5 text-primary" />
                <div className="flex-1">
                  <CardTitle className="text-base">{s.name}</CardTitle>
                  {s.description && (
                    <p className="text-xs text-muted-foreground">{s.description}</p>
                  )}
                </div>
                <form
                  action={deleteStorage.bind(null, s.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" type="submit" className="size-8">
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </form>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {(() => { try { const sh = JSON.parse(s.shelves ?? "[]"); return sh.length + "层" + sh.reduce((a: number, x: any) => a + (x.rows?.length ?? 1), 0) + "格"; } catch { return "1层1格"; } })()} · {s.itemCount} 件物品
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="添加储物">
        <StorageCreateForm
          zoneId={zoneId}
          locationId={locationId}
          onSuccess={() => setOpen(false)}
        />
      </Modal>
    </div>
  );
}
