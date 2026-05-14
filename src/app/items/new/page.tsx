import { db } from "@/lib/db";
import { locations, zones, storages } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ItemCreateForm } from "@/components/forms/item-create-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ storageId?: string; layers?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.storageId) redirect("/locations");

  const storage = await db
    .select()
    .from(storages)
    .where(eq(storages.id, sp.storageId))
    .get();
  if (!storage) notFound();

  const zone = await db
    .select()
    .from(zones)
    .where(eq(zones.id, storage.zoneId))
    .get();
  if (!zone) notFound();

  const location = await db
    .select()
    .from(locations)
    .where(eq(locations.id, zone.locationId))
    .get();

  const layerCount = storage.layers ?? 1;

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/locations/${zone.locationId}/zones/${storage.zoneId}/storages/${storage.id}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {location?.name} → {zone.name} → {storage.name}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>添加物品</CardTitle>
          <p className="text-xs text-muted-foreground">
            {location?.name} → {zone.name} → {storage.name}
          </p>
        </CardHeader>
        <CardContent>
          <ItemCreateForm
            storageId={storage.id}
            zoneId={storage.zoneId}
            locationId={zone.locationId}
            layerCount={layerCount}
          />
        </CardContent>
      </Card>
    </div>
  );
}
