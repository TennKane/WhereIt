import { db } from "@/lib/db";
import { rooms, furnitures, items } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import Link from "next/link";
import { DoorOpen, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const allRooms = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      sortOrder: rooms.sortOrder,
      furnitureCount: sql<number>`count(distinct ${furnitures.id})`,
      itemCount: sql<number>`count(distinct ${items.id})`,
    })
    .from(rooms)
    .leftJoin(furnitures, eq(furnitures.roomId, rooms.id))
    .leftJoin(items, eq(items.furnitureId, furnitures.id))
    .groupBy(rooms.id)
    .orderBy(rooms.sortOrder);

  if (allRooms.length === 0) {
    return (
      <div>
        <h1 className="mb-6 text-2xl font-bold">房间管理</h1>
        <EmptyState
          title="还没有房间"
          description="添加你的第一个房间，开始整理物品吧"
          actionLabel="新建房间"
          actionHref="/rooms/new"
        />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">房间管理</h1>
        <Button asChild>
          <Link href="/rooms/new">
            <Plus className="size-4" />
            新建房间
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {allRooms.map((room) => (
          <Link key={room.id} href={`/rooms/${room.id}`}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-center gap-3 space-y-0">
                <DoorOpen className="size-5 text-primary" />
                <CardTitle>{room.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {room.furnitureCount} 件家具 · {room.itemCount} 件物品
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
