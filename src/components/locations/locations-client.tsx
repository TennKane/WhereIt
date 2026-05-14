"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { EmptyState } from "@/components/shared/empty-state";
import { LocationCreateForm } from "@/components/forms/location-create-form";
import { LocationCard } from "@/components/locations/location-card";

interface LocationItem {
  id: string;
  name: string;
  zoneCount: number;
  storageCount: number;
}

export function LocationsClient({ locations }: { locations: LocationItem[] }) {
  const [open, setOpen] = useState(false);

  if (locations.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">场所管理</h1>
        <EmptyState
          title="还没有场所"
          description="添加你的第一个场所，开始整理吧"
          actionLabel="新建场所"
          onAction={() => setOpen(true)}
        />
        <Modal open={open} onClose={() => setOpen(false)} title="新建场所">
          <LocationCreateForm onSuccess={() => setOpen(false)} />
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">场所管理</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          新建场所
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {locations.map((loc) => (
          <LocationCard key={loc.id} {...loc} />
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="新建场所">
        <LocationCreateForm onSuccess={() => setOpen(false)} />
      </Modal>
    </div>
  );
}
