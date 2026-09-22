import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type AppRole = "ADMIN" | "GURU" | "GURU_TPA" | "GURU_TAHFIDZH" | "KETUA_YAYASAN" | "KETUA_TPA" | "KETUA_TAHFIDZH";

export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

export async function requireRole(allowedRoles: AppRole[]) {
  const { supabase, user } = await requireUser();
  const [{ data: profile }, { data: additionalRoles }] = await Promise.all([
    supabase.from("profiles").select("full_name, role").eq("id", user.id).single(),
    supabase.from("user_roles").select("role").eq("user_id", user.id),
  ]);
  const roles = [profile?.role, ...(additionalRoles ?? []).map((item) => item.role)] as AppRole[];
  if (!profile || !roles.some((role) => allowedRoles.includes(role))) redirect("/dashboard?error=Akses%20tidak%20diizinkan");
  return { supabase, user, profile, roles };
}
