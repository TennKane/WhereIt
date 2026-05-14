"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { zones, storages, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "储物名不能为空").max(30),
  zoneId: z.string().min(1),
  layers: z.coerce.number().int().min(1).max(20).default(1),
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
    layers: parsed.data.layers,
    description: parsed.data.description ?? null,
  });

  if (zone) revalidatePath(`/locations/${zone.locationId}/zones/${parsed.data.zoneId}`);
  return { success: true as const, message: "储物创建成功" };
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
