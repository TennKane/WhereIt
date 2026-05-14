import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteStorage } from "@/lib/actions/storage";

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
      layers: storages.layers,
      description: storages.description,
      itemCount: sql<number>`count(distinct ${items.id})`,
    })
    .from(storages)
    .leftJoin(items, eq(items.storageId, storages.id))
    .where(eq(storages.zoneId, zoneId))
    .groupBy(storages.id)
    .orderBy(storages.sortOrder);

  return (
    <div>
      <div className="mb-6">
        <Link
          href={`/locations/${locationId}`}
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← {location.name}
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{zone.name}</h1>
            <p className="text-sm text-muted-foreground">
              {location.name} → {zone.name}
            </p>
          </div>
          <Button asChild>
            <Link href={`/locations/${locationId}/zones/${zoneId}/storages/new`}>
              <Plus className="size-4" />
              添加储物
            </Link>
          </Button>
        </div>
      </div>

      {storageList.length === 0 ? (
        <EmptyState
          title="这个区域还没有储物"
          description="添加茶几、衣柜、书架等"
          actionLabel="添加储物"
          actionHref={`/locations/${locationId}/zones/${zoneId}/storages/new`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {storageList.map((s) => (
            <Link key={s.id} href={`/locations/${locationId}/zones/${zoneId}/storages/${s.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <Box className="size-5 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="text-base">{s.name}</CardTitle>
                    {s.description && (
                      <p className="text-xs text-muted-foreground">{s.description}</p>
                    )}
                  </div>
                  <form
                    action={deleteStorage.bind(null, s.id)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" type="submit" className="size-8">
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </form>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {s.layers} 层 · {s.itemCount} 件物品
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
