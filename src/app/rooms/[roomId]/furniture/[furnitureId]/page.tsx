import { db } from "@/lib/db";
import { rooms, furnitures, items } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/empty-state";
import { deleteItem } from "@/lib/actions/item";

export default async function FurnitureDetailPage({
  params,
}: {
  params: Promise<{ roomId: string; furnitureId: string }>;
}) {
  const { roomId, furnitureId } = await params;

  const room = await db.select().from(rooms).where(eq(rooms.id, roomId)).get();
  if (!room) notFound();

  const furniture = await db
    .select()
    .from(furnitures)
    .where(eq(furnitures.id, furnitureId))
    .get();
  if (!furniture) notFound();

  const allItems = await db
    .select()
    .from(items)
    .where(eq(items.furnitureId, furnitureId))
    .orderBy(items.layerIndex);

  const layerCount = furniture.layers ?? 1;
  const layers = Array.from({ length: layerCount }, (_, i) => i);
  const itemsByLayer = new Map<number, typeof allItems>();
  for (const item of allItems) {
    const layer = item.layerIndex ?? 0;
    const existing = itemsByLayer.get(layer) ?? [];
    existing.push(item);
    itemsByLayer.set(layer, existing);
  }

  return (
    <div>
      <Link
        href={`/rooms/${roomId}`}
        className="mb-2 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {room.name}
      </Link>

      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{furniture.name}</h1>
            <p className="text-sm text-muted-foreground">
              {room.name} → {furniture.name}
            </p>
          </div>
          <Button asChild>
            <Link
              href={`/items/new?furnitureId=${furnitureId}&layers=${layerCount}`}
            >
              <Plus className="size-4" />
              添加物品
            </Link>
          </Button>
        </div>
      </div>

      {allItems.length === 0 ? (
        <EmptyState
          title="还没有物品"
          description="开始往里面放东西吧"
          actionLabel="添加物品"
          actionHref={`/items/new?furnitureId=${furnitureId}&layers=${layerCount}`}
        />
      ) : (
        <div className="space-y-6">
          {layers.map((layerIndex) => {
            const layerItems = itemsByLayer.get(layerIndex) ?? [];
            if (layerItems.length === 0) return null;

            return (
              <div key={layerIndex}>
                <h2 className="mb-3 text-sm font-medium text-muted-foreground">
                  {layerIndex >= 0 ? `第 ${layerIndex + 1} 层` : "桌面"}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {layerItems.map((item) => (
                    <Card key={item.id} className="relative">
                      <CardHeader className="flex-row items-start gap-3 space-y-0 pr-8">
                        <Package className="mt-0.5 size-4 shrink-0 text-primary" />
                        <div>
                          <CardTitle className="text-sm">
                            {item.name}
                            {(item.quantity ?? 1) > 1 && (
                              <Badge
                                variant="secondary"
                                className="ml-2 text-xs"
                              >
                                x{item.quantity}
                              </Badge>
                            )}
                          </CardTitle>
                          {item.description && (
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </CardHeader>
                      <form
                        action={deleteItem.bind(null, item.id)}
                        className="absolute right-2 top-2"
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          type="submit"
                          className="size-7"
                        >
                          <Trash2 className="size-3 text-muted-foreground" />
                        </Button>
                      </form>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
