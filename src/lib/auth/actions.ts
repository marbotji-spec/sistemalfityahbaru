"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    redirect("/login?error=Email%20dan%20password%20wajib%20diisi");
  }

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?error=Environment%20Supabase%20belum%20terbaca%20di%20deployment%20ini");
  }

  let error: { message: string } | null = null;
  try {
    ({ error } = await supabase.auth.signInWithPassword({ email, password }));
  } catch {
    redirect("/login?error=Login%20gagal%2C%20periksa%20konfigurasi%20Supabase");
  }

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message.includes("Invalid login credentials") ? "Email atau password salah" : error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
