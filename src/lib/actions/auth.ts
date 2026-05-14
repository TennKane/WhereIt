"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "whereit-dev-secret-change-in-production",
);

const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
});

const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export async function register(_: unknown, formData: FormData) {
  try {
    const parsed = registerSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success)
      return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

    const { email, password } = parsed.data;

    const existing = await db.select().from(users).where(eq(users.email, email)).get();
    if (existing) {
      return { success: false as const, fieldErrors: { email: ["该邮箱已注册"] } };
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({ email, passwordHash });

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true as const, message: "注册成功" };
  } catch (error) {
    console.error("注册失败:", error);
    return {
      success: false as const,
      fieldErrors: { email: ["注册失败，请稍后重试"] },
    };
  }
}

export async function login(_: unknown, formData: FormData) {
  try {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success)
      return { success: false as const, fieldErrors: parsed.error.flatten().fieldErrors };

    const { email, password } = parsed.data;

    const user = await db.select().from(users).where(eq(users.email, email)).get();
    if (!user) {
      return { success: false as const, fieldErrors: { email: ["邮箱或密码错误"] } };
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return { success: false as const, fieldErrors: { email: ["邮箱或密码错误"] } };
    }

    const token = await new SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return { success: true as const, message: "登录成功" };
  } catch (error) {
    console.error("登录失败:", error);
    return {
      success: false as const,
      fieldErrors: { email: ["登录失败，请稍后重试"] },
    };
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string };
  } catch {
    return null;
  }
}
