import { db } from "@/lib/db";
import { locations, zones, storages } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

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
          <Link key={loc.id} href={`/locations/${loc.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <MapPin className="size-5 text-primary" />
                <CardTitle>{loc.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {loc.zoneCount} 个区域 · {loc.storageCount} 个储物
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
