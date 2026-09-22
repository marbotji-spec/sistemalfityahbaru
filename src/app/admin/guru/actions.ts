"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";
import { createAdminClient } from "@/lib/supabase/admin";

const teacherSchema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(72),
  full_name: z.string().trim().min(2).max(120),
  nickname: z.string().trim().max(60).optional(),
  phone: z.string().trim().max(24).optional(),
  role: z.enum(["GURU", "KETUA_YAYASAN"]),
  role_guru: z.enum(["on"]).optional(),
  role_ketua_tpa: z.enum(["on"]).optional(),
  role_ketua_tahfizh: z.enum(["on"]).optional(),
});

export async function createTeacher(formData: FormData) {
  const { supabase, user } = await requireRole(["ADMIN", "KETUA_YAYASAN"]);
  const parsed = teacherSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/guru?error=Data%20guru%20belum%20valid");

  const adminClient = createAdminClient();
  const { data: created, error } = await adminClient.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
    user_metadata: { full_name: parsed.data.full_name },
  });

  if (error || !created.user) redirect(`/admin/guru?error=${encodeURIComponent(error?.message ?? "Akun guru gagal dibuat")}`);

  const { error: profileError } = await supabase.from("profiles").update({
    full_name: parsed.data.full_name,
    nickname: parsed.data.nickname || null,
    phone: parsed.data.phone || null,
    role: parsed.data.role,
    updated_at: new Date().toISOString(),
  }).eq("id", created.user.id);

  if (profileError) redirect(`/admin/guru?error=${encodeURIComponent("Akun dibuat tetapi profil gagal disimpan")}`);
  const additionalRoles = [
    ...(parsed.data.role_guru ? ["GURU"] : []),
    ...(parsed.data.role_ketua_tpa ? ["KETUA_TPA"] : []),
    ...(parsed.data.role_ketua_tahfizh ? ["KETUA_TAHFIDZH"] : []),
  ].filter((role) => role !== parsed.data.role);

  if (additionalRoles.length > 0) {
    const { error: rolesError } = await supabase.from("user_roles").insert(
      additionalRoles.map((role) => ({ user_id: created.user!.id, role, created_by: user.id })),
    );
    if (rolesError) redirect(`/admin/guru?error=${encodeURIComponent("Akun dibuat tetapi role tambahan gagal disimpan")}`);
  }
  await supabase.from("audit_logs").insert({
    user_id: user.id,
    role: parsed.data.role,
    action: "CREATE",
    table_name: "profiles",
    record_id: created.user.id,
    new_data: { full_name: parsed.data.full_name, email: parsed.data.email, role: parsed.data.role },
  });

  revalidatePath("/admin/guru");
  redirect("/admin/guru?success=Guru%20berhasil%20ditambahkan");
}

const roleSchema = z.object({
  user_id: z.string().uuid(),
  role: z.enum(["GURU", "KETUA_YAYASAN"]),
  role_guru: z.enum(["on"]).optional(),
  role_ketua_tpa: z.enum(["on"]).optional(),
  role_ketua_tahfizh: z.enum(["on"]).optional(),
});

export async function updateTeacherRoles(formData: FormData) {
  const { supabase, user } = await requireRole(["ADMIN", "KETUA_YAYASAN"]);
  const parsed = roleSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/guru?error=Role%20belum%20valid");

  const selectedRoles = [
    ...(parsed.data.role_guru ? ["GURU"] : []),
    ...(parsed.data.role_ketua_tpa ? ["KETUA_TPA"] : []),
    ...(parsed.data.role_ketua_tahfizh ? ["KETUA_TAHFIDZH"] : []),
  ].filter((role) => role !== parsed.data.role);

  const { error: profileError } = await supabase.from("profiles").update({ role: parsed.data.role }).eq("id", parsed.data.user_id);
  if (profileError) redirect(`/admin/guru?error=${encodeURIComponent("Role utama gagal diperbarui")}`);

  const { error: deleteError } = await supabase.from("user_roles").delete().eq("user_id", parsed.data.user_id);
  if (deleteError) redirect(`/admin/guru?error=${encodeURIComponent("Role tambahan lama gagal dibersihkan")}`);

  if (selectedRoles.length > 0) {
    const { error: insertError } = await supabase.from("user_roles").insert(selectedRoles.map((role) => ({ user_id: parsed.data.user_id, role, created_by: user.id })));
    if (insertError) redirect(`/admin/guru?error=${encodeURIComponent("Role tambahan gagal diperbarui")}`);
  }

  await supabase.from("audit_logs").insert({
    user_id: user.id,
    role: parsed.data.role,
    action: "UPDATE",
    table_name: "profiles",
    record_id: parsed.data.user_id,
    new_data: { primary_role: parsed.data.role, additional_roles: selectedRoles },
  });

  revalidatePath("/admin/guru");
  redirect("/admin/guru?success=Role%20berhasil%20diperbarui");
}
