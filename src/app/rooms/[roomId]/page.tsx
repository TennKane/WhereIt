import { db } from "@/lib/db";
import { rooms, furnitures, items } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteRoom } from "@/lib/actions/room";
import { deleteFurniture } from "@/lib/actions/furniture";

export default async function RoomDetailPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;

  const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room) notFound();

  const furnitureList = await db
    .select({
      id: furnitures.id,
      name: furnitures.name,
      layers: furnitures.layers,
      description: furnitures.description,
      itemCount: sql<number>`count(distinct ${items.id})`,
    })
    .from(furnitures)
    .leftJoin(items, eq(items.furnitureId, furnitures.id))
    .where(eq(furnitures.roomId, roomId))
    .groupBy(furnitures.id)
    .orderBy(furnitures.sortOrder);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/rooms"
          className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          ← 房间列表
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{room.name}</h1>
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/rooms/${roomId}/furniture/new`}>
                <Plus className="size-4" />
                添加家具
              </Link>
            </Button>
            <form action={deleteRoom.bind(null, roomId)}>
              <Button variant="ghost" size="icon" type="submit">
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </form>
          </div>
        </div>
      </div>

      {furnitureList.length === 0 ? (
        <EmptyState
          title="这个房间还没有家具"
          description="添加茶几、衣柜、书架等家具来开始收纳"
          actionLabel="添加家具"
          actionHref={`/rooms/${roomId}/furniture/new`}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {furnitureList.map((f) => (
            <Link key={f.id} href={`/rooms/${roomId}/furniture/${f.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-center gap-3 space-y-0">
                  <Box className="size-5 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="text-base">{f.name}</CardTitle>
                    {f.description && (
                      <p className="text-xs text-muted-foreground">
                        {f.description}
                      </p>
                    )}
                  </div>
                  <form
                    action={deleteFurniture.bind(null, f.id)}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      type="submit"
                      className="size-8"
                    >
                      <Trash2 className="size-3.5 text-muted-foreground" />
                    </Button>
                  </form>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {f.layers} 层 · {f.itemCount} 件物品
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
