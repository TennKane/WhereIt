import { addItem } from "@/lib/actions/item";
import { db } from "@/lib/db";
import { rooms, furnitures } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function NewItemPage({
  searchParams,
}: {
  searchParams: Promise<{ furnitureId?: string; layers?: string }>;
}) {
  const sp = await searchParams;
  if (!sp.furnitureId) redirect("/rooms");

  const furniture = await db
    .select()
    .from(furnitures)
    .where(eq(furnitures.id, sp.furnitureId))
    .get();
  if (!furniture) notFound();

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, furniture.roomId))
    .get();

  const layerCount = furniture.layers ?? 1;

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/rooms/${furniture.roomId}/furniture/${furniture.id}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        {room?.name} → {furniture.name}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>添加物品</CardTitle>
          <p className="text-xs text-muted-foreground">
            {room?.name} → {furniture.name}
          </p>
        </CardHeader>
        <CardContent>
          <form action={addItem} className="space-y-4">
            <input type="hidden" name="furnitureId" value={furniture.id} />

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                物品名称
              </label>
              <Input
                id="name"
                name="name"
                placeholder="例如：电视遥控器"
                required
                autoFocus
              />
            </div>

            {layerCount > 1 && (
              <div>
                <label
                  htmlFor="layerIndex"
                  className="mb-1.5 block text-sm font-medium"
                >
                  存放层
                </label>
                <select
                  id="layerIndex"
                  name="layerIndex"
                  className="flex h-10 w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm"
                >
                  {Array.from({ length: layerCount }, (_, i) => (
                    <option key={i} value={i}>
                      第 {i + 1} 层
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label
                htmlFor="quantity"
                className="mb-1.5 block text-sm font-medium"
              >
                数量
              </label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min={1}
                defaultValue={1}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium"
              >
                备注（可选）
              </label>
              <Input
                id="description"
                name="description"
                placeholder="颜色、品牌等"
              />
            </div>

            <Button type="submit" className="w-full">
              添加
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
