"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Layers, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Modal } from "@/components/ui/modal";
import { ZoneCreateForm } from "@/components/forms/zone-create-form";
import { DeleteLocationButton } from "@/app/locations/[locationId]/delete-button";
import { deleteZone } from "@/lib/actions/zone";

interface ZoneItem {
  id: string;
  name: string;
  storageCount: number;
}

interface Props {
  locationId: string;
  locationName: string;
  zones: ZoneItem[];
}

export function LocationDetailClient({ locationId, locationName, zones }: Props) {
  const [open, setOpen] = useState(false);

  if (zones.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <Link
            href="/locations"
            className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            ← 场所列表
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{locationName}</h1>
            <div className="flex gap-2">
              <Button onClick={() => setOpen(true)}>
                <Plus className="size-4" />
                添加区域
              </Button>
              <DeleteLocationButton locationId={locationId} locationName={locationName} />
            </div>
          </div>
        </div>
        <EmptyState
          title="这个场所还没有区域"
          description="添加客厅、卧室、工位等区域来开始收纳"
          actionLabel="添加区域"
          onAction={() => setOpen(true)}
        />
        <Modal open={open} onClose={() => setOpen(false)} title="添加区域">
          <ZoneCreateForm locationId={locationId} onSuccess={() => setOpen(false)} />
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/locations"
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 场所列表
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{locationName}</h1>
          <div className="flex gap-2">
            <Button onClick={() => setOpen(true)}>
              <Plus className="size-4" />
              添加区域
            </Button>
            <DeleteLocationButton locationId={locationId} locationName={locationName} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {zones.map((z) => (
          <Link key={z.id} href={`/locations/${locationId}/zones/${z.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <Layers className="size-5 text-primary" />
                <div className="flex-1">
                  <CardTitle className="text-base">{z.name}</CardTitle>
                </div>
                <form
                  action={deleteZone.bind(null, z.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" type="submit" className="size-8">
                    <Trash2 className="size-3.5 text-muted-foreground" />
                  </Button>
                </form>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {z.storageCount} 个储物
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="添加区域">
        <ZoneCreateForm locationId={locationId} onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
