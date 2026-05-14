import { db } from "@/lib/db";
import { locations, zones, storages } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteZone } from "@/lib/actions/zone";
import { deleteLocation } from "@/lib/actions/location";

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
      storageCount: sql<number>`count(distinct ${storages.id})`,
    })
    .from(zones)
    .leftJoin(storages, eq(storages.zoneId, zones.id))
    .where(eq(zones.locationId, locationId))
    .groupBy(zones.id)
    .orderBy(zones.sortOrder);

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
          <h1 className="text-2xl font-bold">{location.name}</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/locations/${locationId}/zones/new`}>
                <Plus className="size-4" />
                添加区域
              </Link>
            </Button>
            <form action={deleteLocation.bind(null, locationId)}>
              <Button variant="ghost" size="icon" type="submit">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {zoneList.length === 0 ? (
        <EmptyState
          title="这个场所还没有区域"
          description="添加客厅、卧室、工位等区域来开始收纳"
          actionLabel="添加区域"
          actionHref={`/locations/${locationId}/zones/new`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {zoneList.map((z) => (
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
      )}
    </div>
  );
}
