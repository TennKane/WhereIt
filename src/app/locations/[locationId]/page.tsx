import { db } from "@/lib/db";
import { locations, zones, storages } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import { LocationDetailClient } from "@/components/locations/location-detail-client";

export const dynamic = "force-dynamic";

export default async function LocationDetailPage({
  params,
}: {
  params: Promise<{ locationId: string }>;
}) {
  const { locationId } = await params;

  const location = await db.select().from(locations).where(eq(locations.id, locationId)).get();
  if (!location) notFound();

  const zoneList = await db
    .select({
      id: zones.id,
      name: zones.name,
      isFavorite: zones.isFavorite,
      storageCount: sql<number>`count(distinct ${storages.id})`,
    })
    .from(zones)
    .leftJoin(storages, eq(storages.zoneId, zones.id))
    .where(eq(zones.locationId, locationId))
    .groupBy(zones.id)
    .orderBy(zones.sortOrder);

  return (
    <LocationDetailClient
      locationId={locationId}
      locationName={location.name}
      zones={zoneList}
    />
  );
}
