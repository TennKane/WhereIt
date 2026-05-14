import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ZoneDetailClient } from "@/components/locations/zone-detail-client";

export const dynamic = "force-dynamic";

export default async function ZoneDetailPage({
  params,
}: {
  params: Promise<{ locationId: string; zoneId: string }>;
}) {
  const { locationId, zoneId } = await params;

  const location = await db.select().from(locations).where(eq(locations.id, locationId)).get();
  if (!location) notFound();

  const zone = await db.select().from(zones).where(eq(zones.id, zoneId)).get();
  if (!zone) notFound();

  const storageList = await db
    .select({
      id: storages.id,
      name: storages.name,
      shelves: storages.shelves,
      description: storages.description,
      itemCount: sql<number>`count(distinct ${items.id})`,
    })
    .from(storages)
    .leftJoin(items, eq(items.storageId, storages.id))
    .where(eq(storages.zoneId, zoneId))
    .groupBy(storages.id)
    .orderBy(storages.sortOrder);

  return (
    <ZoneDetailClient
      locationId={locationId}
      locationName={location.name}
      zoneId={zoneId}
      zoneName={zone.name}
      storages={storageList}
    />
  );
}
