"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { zones } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "区域名不能为空").max(20),
  locationId: z.string().min(1),
});

export async function createZone(_: unknown, formData: FormData) {
  const parsed = createSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success)
    return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };
  await db.insert(zones).values({
    name: parsed.data.name,
    locationId: parsed.data.locationId,
  });
  revalidatePath(`/locations/${parsed.data.locationId}`);
  return { success: true as const, message: "区域创建成功" };
}

export async function deleteZone(id: string) {
  const zone = await db
    .select({ locationId: zones.locationId })
    .from(zones)
    .where(eq(zones.id, id))
    .get();
  if (zone) {
    await db.delete(zones).where(eq(zones.id, id));
    revalidatePath(`/locations/${zone.locationId}`);
  }
}

export async function toggleFavorite(_: unknown, formData: FormData) {
  const id = formData.get("id") as string;
  const value = formData.get("isFavorite") === "1" ? 0 : 1;
  if (!id) return;
  await db.update(zones).set({ isFavorite: value }).where(eq(zones.id, id));
  revalidatePath("/");
  const zone = await db.select({ locationId: zones.locationId }).from(zones).where(eq(zones.id, id)).get();
  if (zone) revalidatePath(`/locations/${zone.locationId}`);
}
