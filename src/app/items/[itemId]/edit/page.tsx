import { db } from "@/lib/db";
import { rooms, furnitures, items } from "@/lib/db/schema";
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
import { editItem } from "@/lib/actions/item";

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;

  const item = await db
    .select()
    .from(items)
    .where(eq(items.id, itemId))
    .get();
  if (!item) notFound();

  const furniture = await db
    .select()
    .from(furnitures)
    .where(eq(furnitures.id, item.furnitureId))
    .get();
  if (!furniture) redirect("/rooms");

  const room = await db
    .select()
    .from(rooms)
    .where(eq(rooms.id, furniture.roomId))
    .get();

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/rooms/${furniture.roomId}/furniture/${furniture.id}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>编辑物品</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={editItem.bind(null, itemId)} className="space-y-4">
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
                defaultValue={item.name}
                required
              />
            </div>

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
                defaultValue={item.quantity ?? 1}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1.5 block text-sm font-medium"
              >
                备注
              </label>
              <Input
                id="description"
                name="description"
                defaultValue={item.description ?? ""}
              />
            </div>

            <Button type="submit" className="w-full">
              保存
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
