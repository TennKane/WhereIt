"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { items } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "物品名不能为空").max(50),
  furnitureId: z.string().min(1),
  layerIndex: z.coerce.number().int().default(0),
  quantity: z.coerce.number().int().min(1).default(1),
  description: z.string().max(200).optional(),
});

export async function createItem(_: unknown, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.insert(items).values({
    name: parsed.data.name,
    furnitureId: parsed.data.furnitureId,
    layerIndex: parsed.data.layerIndex,
    quantity: parsed.data.quantity,
    description: parsed.data.description ?? null,
  });

  revalidatePath(`/rooms`);
}

export async function addItem(formData: FormData) {
  await createItem(null, formData);
}

export async function deleteItem(id: string) {
  await db.delete(items).where(eq(items.id, id));
  revalidatePath("/rooms");
}

export async function updateItem(
  id: string,
  _: unknown,
  formData: FormData,
) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db
    .update(items)
    .set({
      name: parsed.data.name,
      layerIndex: parsed.data.layerIndex,
      quantity: parsed.data.quantity,
      description: parsed.data.description ?? null,
    })
    .where(eq(items.id, id));

  revalidatePath("/rooms");
}

export async function editItem(id: string, formData: FormData) {
  await updateItem(id, null, formData);
}
