"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { zones, storages, items } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "储物名不能为空").max(30),
  zoneId: z.string().min(1),
  shelves: z.string().min(2, "请至少添加一层"),
  description: z.string().max(200).optional(),
});

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "储物名不能为空").max(30),
  shelves: z.string().min(2, "请至少添加一层"),
  description: z.string().max(200).optional(),
});

export async function createStorage(_: unknown, formData: FormData) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

  const zone = await db
    .select({ locationId: zones.locationId })
    .from(zones)
    .where(eq(zones.id, parsed.data.zoneId))
    .get();

  await db.insert(storages).values({
    name: parsed.data.name,
    zoneId: parsed.data.zoneId,
    shelves: parsed.data.shelves,
    description: parsed.data.description ?? null,
  });

  if (zone) revalidatePath(`/locations/${zone.locationId}/zones/${parsed.data.zoneId}`);
  return { success: true as const, message: "储物创建成功" };
}

export async function updateStorage(_: unknown, formData: FormData) {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await db
      .update(storages)
      .set({
        name: parsed.data.name,
        shelves: parsed.data.shelves,
        description: parsed.data.description ?? null,
        updatedAt: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(storages.id, parsed.data.id));

    revalidatePath("/locations");
    return { success: true as const, message: "已更新" };
  } catch (error) {
    console.error("更新储物失败:", error);
    return { success: false as const, message: "更新失败" };
  }
}

export async function deleteStorage(id: string) {
  const storage = await db
    .select({ zoneId: storages.zoneId })
    .from(storages)
    .where(eq(storages.id, id))
    .get();

  if (storage) {
    await db.delete(items).where(eq(items.storageId, id));
    await db.delete(storages).where(eq(storages.id, id));
    const zone = await db
      .select({ locationId: zones.locationId })
      .from(zones)
      .where(eq(zones.id, storage.zoneId))
      .get();
    if (zone) revalidatePath(`/locations/${zone.locationId}/zones/${storage.zoneId}`);
  }
}
