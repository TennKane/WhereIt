"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { locations } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

export async function deleteLocation(id: string) {
  await db.delete(locations).where(eq(locations.id, id));
  revalidatePath("/locations");
}
