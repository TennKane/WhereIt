import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { MapPin, Layers, Box, Package } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [locationCount] = await db.select({ count: count() }).from(locations);
  const [zoneCount] = await db.select({ count: count() }).from(zones);
  const [storageCount] = await db.select({ count: count() }).from(storages);
  const [itemCount] = await db.select({ count: count() }).from(items);

  const recentItems = await db
    .select({
      id: items.id,
      name: items.name,
      storageName: storages.name,
      zoneName: zones.name,
      locationName: locations.name,
      layerIndex: items.layerIndex,
    })
    .from(items)
    .leftJoin(storages, eq(items.storageId, storages.id))
    .leftJoin(zones, eq(storages.zoneId, zones.id))
    .leftJoin(locations, eq(zones.locationId, locations.id))
    .orderBy(sql`${items.createdAt} DESC`)
    .limit(5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">WhereIt</h1>
        <p className="text-muted-foreground mt-1">家庭物品收纳管理</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <Link href="/locations">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <MapPin className="size-5 text-primary" />
              <CardTitle className="text-sm">场所</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{locationCount.count}</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Layers className="size-5 text-primary" />
            <CardTitle className="text-sm">区域</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{zoneCount.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Box className="size-5 text-primary" />
            <CardTitle className="text-sm">储物</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{storageCount.count}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Package className="size-5 text-primary" />
            <CardTitle className="text-sm">物品</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{itemCount.count}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近存放</CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              还没有物品，去场所里添加吧
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recentItems.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between py-2.5 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {item.locationName} → {item.zoneName} → {item.storageName}
                    {item.layerIndex !== null && item.layerIndex >= 0
                      ? ` → 第${item.layerIndex + 1}层`
                      : item.layerIndex === -1
                        ? " → 桌面"
                        : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
