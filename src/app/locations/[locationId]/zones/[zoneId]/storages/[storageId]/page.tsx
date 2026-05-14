import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { StorageDetailClient } from "@/components/locations/storage-detail-client";

export const dynamic = "force-dynamic";

function parseShelves(raw: string | null): { name: string; rows: { name: string }[] }[] {
  try {
    return JSON.parse(raw ?? "[]");
  } catch {
    return [{ name: "第一层", rows: [{ name: "第一格" }] }];
  }
}

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
    .orderBy(items.shelfIndex, items.rowIndex);

  const shelves = parseShelves(storage.shelves);

  // group items by "shelfIndex-rowIndex"
  const itemsByShelfRow: Record<string, typeof allItems> = {};
  for (const item of allItems) {
    const key = `${item.shelfIndex ?? 0}-${item.rowIndex ?? 0}`;
    (itemsByShelfRow[key] ??= []).push(item);
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
      shelves={shelves}
      itemsByShelfRow={itemsByShelfRow}
    />
  );
}
