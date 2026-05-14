import { db } from "@/lib/db";
import { locations, zones, storages } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { LocationsClient } from "@/components/locations/locations-client";

export const dynamic = "force-dynamic";

export default async function LocationsPage() {
  const allLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      sortOrder: locations.sortOrder,
      zoneCount: sql<number>`count(distinct ${zones.id})`,
      storageCount: sql<number>`count(distinct ${storages.id})`,
    })
    .from(locations)
    .leftJoin(zones, eq(zones.locationId, locations.id))
    .leftJoin(storages, eq(storages.zoneId, zones.id))
    .groupBy(locations.id)
    .orderBy(locations.sortOrder);

  return <LocationsClient locations={allLocations} />;
}
