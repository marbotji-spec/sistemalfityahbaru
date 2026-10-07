"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireRole } from "@/lib/auth/authorization";

const studentSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  nickname: z.preprocess((value) => value || undefined, z.string().trim().max(60).optional()),
  nis: z.preprocess((value) => value || undefined, z.string().trim().max(40).optional()),
  gender: z.preprocess((value) => value || undefined, z.enum(["L", "P"]).optional()),
  guardian_name: z.preprocess((value) => value || undefined, z.string().trim().max(120).optional()),
  guardian_phone: z.preprocess((value) => value || undefined, z.string().trim().max(24).optional()),
  program_id: z.preprocess((value) => value || undefined, z.string().uuid().optional()),
  class_id: z.preprocess((value) => value || undefined, z.string().uuid().optional()),
  branch: z.enum(["GOWA", "BARRU", "BULUKUMBA"]).default("GOWA"),
});

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = studentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/santri?error=Data%20santri%20belum%20valid");

  let programPrefix = "SANTRI";
  if (parsed.data.program_id) {
    const { data: program } = await supabase.from("programs").select("name").eq("id", parsed.data.program_id).maybeSingle();
    const programName = program?.name?.toUpperCase() ?? "";
    programPrefix = programName.includes("TAHF") ? "TF" : programName.includes("TPA") ? "TPA" : "SANTRI";
  }
  const publicCode = `${programPrefix}-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { error } = await supabase.from("students").insert({
    ...parsed.data,
    public_code: publicCode,
    branch: parsed.data.branch,
    nickname: parsed.data.nickname || null,
    nis: parsed.data.nis || null,
    gender: parsed.data.gender || null,
    guardian_name: parsed.data.guardian_name || null,
    guardian_phone: parsed.data.guardian_phone || null,
    program_id: parsed.data.program_id || null,
    class_id: parsed.data.class_id || null,
    created_by: user.id,
    updated_by: user.id,
  });

  if (error) {
    const message = error.code === "23505" ? "Kode santri sudah digunakan" : "Santri gagal disimpan";
    redirect(`/admin/santri?error=${encodeURIComponent(message)}`);
  }

  revalidatePath("/admin/santri");
  redirect("/admin/santri?success=Santri%20berhasil%20ditambahkan");
}

const renameStudentSchema = z.object({
  student_id: z.string().uuid(),
  full_name: z.string().trim().min(2).max(120),
});

export async function updateStudentName(formData: FormData) {
  const { supabase, user } = await requireRole(["ADMIN", "GURU", "GURU_TPA", "KETUA_TPA"]);
  const parsed = renameStudentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/santri?error=Nama%20santri%20tidak%20valid");

  const { data: student } = await supabase.from("students").select("id, branch, program_id").eq("id", parsed.data.student_id).maybeSingle();
  if (!student || student.branch !== "GOWA") redirect("/admin/santri?error=Santri%20Gowa%20tidak%20ditemukan");

  const { data: program } = student.program_id
    ? await supabase.from("programs").select("name").eq("id", student.program_id).maybeSingle()
    : { data: null };
  if (program?.name.toUpperCase() !== "TPA") redirect("/admin/santri?error=Nama%20hanya%20dapat%20diedit%20dari%20modul%20santri%20TPA");

  const adminClient = createAdminClient();
  const { error } = await adminClient.from("students").update({
    full_name: parsed.data.full_name,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  }).eq("id", student.id).eq("branch", "GOWA");

  if (error) redirect(`/admin/santri?error=${encodeURIComponent("Nama santri gagal diperbarui")}`);
  revalidatePath("/admin/santri");
  revalidatePath("/admin/tpa");
  redirect("/admin/santri?success=Nama%20santri%20berhasil%20diperbarui");
}
