"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { items, storages, zones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "物品名不能为空").max(50),
  storageId: z.string().min(1),
  layerIndex: z.coerce.number().int().default(0),
  quantity: z.coerce.number().int().min(1).default(1),
  description: z.string().max(200).optional(),
});

export async function createItem(_: unknown, formData: FormData) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

  await db.insert(items).values({
    name: parsed.data.name,
    storageId: parsed.data.storageId,
    layerIndex: parsed.data.layerIndex,
    quantity: parsed.data.quantity,
    description: parsed.data.description ?? null,
  });

  const storage = await db
    .select({ zoneId: storages.zoneId })
    .from(storages)
    .where(eq(storages.id, parsed.data.storageId))
    .get();
  if (storage) {
    const zone = await db
      .select({ locationId: zones.locationId })
      .from(zones)
      .where(eq(zones.id, storage.zoneId))
      .get();
    if (zone) revalidatePath(`/locations/${zone.locationId}/zones/${storage.zoneId}/storages/${parsed.data.storageId}`);
  }

  return { success: true as const, message: "物品添加成功" };
}

export async function deleteItem(id: string) {
  await db.delete(items).where(eq(items.id, id));
  revalidatePath("/locations");
}

export async function updateItem(
  id: string,
  _: unknown,
  formData: FormData,
) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

  const item = await db
    .select({ storageId: items.storageId })
    .from(items)
    .where(eq(items.id, id))
    .get();

  await db
    .update(items)
    .set({
      name: parsed.data.name,
      layerIndex: parsed.data.layerIndex,
      quantity: parsed.data.quantity,
      description: parsed.data.description ?? null,
    })
    .where(eq(items.id, id));

  let redirectPath = "/locations";
  if (item) {
    const storage = await db
      .select({ zoneId: storages.zoneId })
      .from(storages)
      .where(eq(storages.id, item.storageId))
      .get();
    if (storage) {
      const zone = await db
        .select({ locationId: zones.locationId })
        .from(zones)
        .where(eq(zones.id, storage.zoneId))
        .get();
      if (zone) {
        redirectPath = `/locations/${zone.locationId}/zones/${storage.zoneId}/storages/${item.storageId}`;
      }
    }
    revalidatePath(redirectPath);
  }

  return { success: true as const, message: "物品编辑成功", redirectTo: redirectPath };
}
