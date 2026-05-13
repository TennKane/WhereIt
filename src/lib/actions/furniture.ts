"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { furnitures, items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "家具名不能为空").max(30),
  roomId: z.string().min(1),
  layers: z.coerce.number().int().min(1).max(20).default(1),
  description: z.string().max(200).optional(),
});

export async function createFurniture(_: unknown, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.insert(furnitures).values({
    name: parsed.data.name,
    roomId: parsed.data.roomId,
    layers: parsed.data.layers,
    description: parsed.data.description ?? null,
  });

  revalidatePath(`/rooms/${parsed.data.roomId}`);
}

export async function addFurniture(formData: FormData) {
  await createFurniture(null, formData);
}

export async function deleteFurniture(id: string) {
  const furniture = await db
    .select({ roomId: furnitures.roomId })
    .from(furnitures)
    .where(eq(furnitures.id, id))
    .get();

  if (furniture) {
    await db.delete(items).where(eq(items.furnitureId, id));
    await db.delete(furnitures).where(eq(furnitures.id, id));
    revalidatePath(`/rooms/${furniture.roomId}`);
  }
}
