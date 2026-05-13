import { db } from "@/lib/db";
import { rooms, furnitures, items } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { DoorOpen, Box, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [roomCount] = await db.select({ count: count() }).from(rooms);
  const [furnitureCount] = await db
    .select({ count: count() })
    .from(furnitures);
  const [itemCount] = await db.select({ count: count() }).from(items);

  const recentItems = await db
    .select({
      id: items.id,
      name: items.name,
      furnitureName: furnitures.name,
      roomName: rooms.name,
      layerIndex: items.layerIndex,
    })
    .from(items)
    .leftJoin(furnitures, eq(items.furnitureId, furnitures.id))
    .leftJoin(rooms, eq(furnitures.roomId, rooms.id))
    .orderBy(sql`${items.createdAt} DESC`)
    .limit(5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">WhereIt</h1>
        <p className="text-muted-foreground mt-1">家庭物品收纳管理</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/rooms">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-center gap-3 space-y-0">
              <DoorOpen className="size-5 text-primary" />
              <CardTitle className="text-sm">房间</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{roomCount.count}</p>
            </CardContent>
          </Card>
        </Link>
        <Card>
          <CardHeader className="flex-row items-center gap-3 space-y-0">
            <Box className="size-5 text-primary" />
            <CardTitle className="text-sm">家具</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{furnitureCount.count}</p>
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

      <div className="mb-6 flex gap-3">
        <Button asChild>
          <Link href="/rooms">管理房间</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/rooms/new">+ 新建房间</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">最近存放</CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              还没有物品，去房间里添加吧
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
                    {item.roomName} → {item.furnitureName}
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
