"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const studentSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  nickname: z.preprocess((value) => value || undefined, z.string().trim().max(60).optional()),
  nis: z.preprocess((value) => value || undefined, z.string().trim().max(40).optional()),
  gender: z.preprocess((value) => value || undefined, z.enum(["L", "P"]).optional()),
  guardian_name: z.preprocess((value) => value || undefined, z.string().trim().max(120).optional()),
  guardian_phone: z.preprocess((value) => value || undefined, z.string().trim().max(24).optional()),
  program_id: z.preprocess((value) => value || undefined, z.string().uuid().optional()),
  class_id: z.preprocess((value) => value || undefined, z.string().uuid().optional()),
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
    programPrefix = programName.includes("TAHF") ? "TAHFIDZH" : programName.includes("TPA") ? "TPA" : "SANTRI";
  }
  const publicCode = `${programPrefix}-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const { error } = await supabase.from("students").insert({
    ...parsed.data,
    public_code: publicCode,
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
