import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "ADMIN" | "GURU" | "KETUA_YAYASAN";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const { supabase, user } = await requireUser();
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).single();
  if (!profile || !allowedRoles.includes(profile.role as AppRole)) redirect("/dashboard?error=Akses%20tidak%20diizinkan");
  return { supabase, user, profile };
}
