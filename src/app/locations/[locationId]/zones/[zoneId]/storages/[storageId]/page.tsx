import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StorageDetailClient } from "@/components/locations/storage-detail-client";

export const dynamic = "force-dynamic";

export default async function StorageDetailPage({
  params,
}: {
  params: Promise<{ locationId: string; zoneId: string; storageId: string }>;
}) {
  const { locationId, zoneId, storageId } = await params;

  const location = await db.select().from(locations).where(eq(locations.id, locationId)).get();
  if (!location) notFound();

  const zone = await db.select().from(zones).where(eq(zones.id, zoneId)).get();
  if (!zone) notFound();

  const storage = await db.select().from(storages).where(eq(storages.id, storageId)).get();
  if (!storage) notFound();

  const allItems = await db
    .select()
    .from(items)
    .where(eq(items.storageId, storageId))
    .orderBy(items.layerIndex);

  const layerCount = storage.layers ?? 1;
  const layerIndices = Array.from({ length: layerCount }, (_, i) => i);
  const itemsByLayer: Record<number, typeof allItems> = {};
  for (const item of allItems) {
    const layer = item.layerIndex ?? 0;
    const existing = itemsByLayer[layer] ?? [];
    existing.push(item);
    itemsByLayer[layer] = existing;
  }

  return (
    <StorageDetailClient
      locationId={locationId}
      locationName={location.name}
      zoneId={zoneId}
      zoneName={zone.name}
      storageId={storageId}
      storageName={storage.name}
      storageDescription={storage.description}
      layerCount={layerCount}
      layers={layerIndices}
      itemsByLayer={itemsByLayer}
      allItems={allItems}
    />
  );
}
