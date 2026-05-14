import { db } from "@/lib/db";
import { locations, zones, storages } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { LocationCard } from "@/components/locations/location-card";

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

  if (allLocations.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">场所管理</h1>
        <EmptyState
          title="还没有场所"
          description="添加你的第一个场所，开始整理吧"
          actionLabel="新建场所"
          actionHref="/locations/new"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">场所管理</h1>
        <Button asChild>
          <Link href="/locations/new">
            <Plus className="size-4" />
            新建场所
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allLocations.map((loc) => (
          <LocationCard
            key={loc.id}
            id={loc.id}
            name={loc.name}
            zoneCount={loc.zoneCount}
            storageCount={loc.storageCount}
          />
        ))}
      </div>
    </div>
  );
}
