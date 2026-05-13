"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { rooms } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "房间名不能为空").max(20),
});

export async function createRoom(_: unknown, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  await db.insert(rooms).values({ name: parsed.data.name });
  revalidatePath("/rooms");
}

export async function addRoom(formData: FormData) {
  await createRoom(null, formData);
}

export async function deleteRoom(id: string) {
  await db.delete(rooms).where(eq(rooms.id, id));
  revalidatePath("/rooms");
}
