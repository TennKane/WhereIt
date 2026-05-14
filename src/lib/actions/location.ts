"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { locations, zones, storages, items } from "@/lib/db/schema";
import { eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "场所名不能为空").max(20),
});

export async function createLocation(_: unknown, formData: FormData) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  await db.insert(locations).values({ name: parsed.data.name });
  revalidatePath("/locations");
  return { success: true as const, message: "场所创建成功" };
}

export async function deleteLocation(_: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  if (!id) return { success: false as const, message: "缺少场所 ID" };

  try {
    // 先删除该场所下所有区域 → 储物 → 物品
    const locationZones = await db.select({ id: zones.id }).from(zones).where(eq(zones.locationId, id));
    const zoneIds = locationZones.map((z) => z.id);

    if (zoneIds.length > 0) {
      const zoneStorages = await db.select({ id: storages.id }).from(storages).where(inArray(storages.zoneId, zoneIds));
      const storageIds = zoneStorages.map((s) => s.id);

      if (storageIds.length > 0) {
        await db.delete(items).where(inArray(items.storageId, storageIds));
        await db.delete(storages).where(inArray(storages.zoneId, zoneIds));
      }
      await db.delete(zones).where(eq(zones.locationId, id));
    }

    await db.delete(locations).where(eq(locations.id, id));
    revalidatePath("/locations");
    return { success: true as const, message: "已删除" };
  } catch (error) {
    console.error("删除场所失败:", error);
    return { success: false as const, message: "删除失败，请稍后重试" };
  }
}

const updateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1, "场所名不能为空").max(20),
});

export async function updateLocation(_: unknown, formData: FormData) {
  const parsed = updateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

  try {
    await db
      .update(locations)
      .set({ name: parsed.data.name, updatedAt: sql`CURRENT_TIMESTAMP` })
      .where(eq(locations.id, parsed.data.id));
    revalidatePath("/locations");
    return { success: true as const, message: "已更新" };
  } catch (error) {
    console.error("更新场所失败:", error);
    return { success: false as const, message: "更新失败，请稍后重试" };
  }
}
