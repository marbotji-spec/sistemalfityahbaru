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
  phone: z.string().trim().min(8).max(24),
  role: z.enum(["GURU", "KETUA_YAYASAN"]),
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
    phone: parsed.data.phone,
    role: parsed.data.role,
    updated_at: new Date().toISOString(),
  }).eq("id", created.user.id);

  if (profileError) redirect(`/admin/guru?error=${encodeURIComponent("Akun dibuat tetapi profil gagal disimpan")}`);
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
