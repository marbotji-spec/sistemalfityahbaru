"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

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

export async function requestPasswordReset(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/forgot-password?error=Email%20wajib%20diisi");

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL;
  if (!origin) redirect("/forgot-password?error=URL%20aplikasi%20belum%20dikonfigurasi");

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    });
    if (error) redirect(`/forgot-password?error=${encodeURIComponent("Email reset gagal dikirim")}`);
  } catch {
    redirect("/forgot-password?error=Supabase%20belum%20terhubung");
  }

  redirect("/forgot-password?success=Jika%20email%20terdaftar%2C%20link%20reset%20sudah%20dikirim");
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");
  if (password.length < 8) redirect("/reset-password?error=Password%20minimal%208%20karakter");
  if (password !== confirmation) redirect("/reset-password?error=Konfirmasi%20password%20tidak%20sama");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/reset-password?error=${encodeURIComponent("Password gagal diperbarui")}`);
  redirect("/login?success=Password%20berhasil%20diperbarui");
}
