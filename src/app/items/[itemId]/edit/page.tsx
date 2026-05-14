import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { ItemEditForm } from "@/components/forms/item-edit-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

function parseShelves(raw: string | null): { name: string; rows: { name: string }[] }[] {
  try {
    return JSON.parse(raw ?? "[]");
  } catch {
    return [{ name: "第一层", rows: [{ name: "第一格" }] }];
  }
}

export default async function EditItemPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;

  const item = await db.select().from(items).where(eq(items.id, itemId)).get();
  if (!item) notFound();

  const storage = await db.select().from(storages).where(eq(storages.id, item.storageId)).get();
  if (!storage) redirect("/locations");

  const zone = await db.select().from(zones).where(eq(zones.id, storage.zoneId)).get();
  if (!zone) redirect("/locations");

  const location = await db.select().from(locations).where(eq(locations.id, zone.locationId)).get();
  const shelves = parseShelves(storage.shelves);

  return (
    <div className="mx-auto max-w-md">
      <Link
        href={`/locations/${zone.locationId}/zones/${storage.zoneId}/storages/${storage.id}`}
        className="mb-6 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        返回
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>编辑物品</CardTitle>
          <p className="text-xs text-muted-foreground">
            {location?.name} → {zone.name} → {storage.name}
          </p>
        </CardHeader>
        <CardContent>
          <ItemEditForm
            itemId={item.id}
            storageId={storage.id}
            zoneId={storage.zoneId}
            locationId={zone.locationId}
            shelves={shelves}
            defaultValues={{
              name: item.name,
              quantity: item.quantity ?? 1,
              description: item.description,
              shelfIndex: item.shelfIndex ?? 0,
              rowIndex: item.rowIndex ?? 0,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
