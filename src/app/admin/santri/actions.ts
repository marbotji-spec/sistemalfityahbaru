"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const studentSchema = z.object({
  public_code: z.string().trim().min(6).max(40).regex(/^[A-Za-z0-9-]+$/),
  full_name: z.string().trim().min(2).max(120),
  nickname: z.string().trim().max(60).optional(),
  gender: z.enum(["L", "P"]),
  guardian_name: z.string().trim().min(2).max(120),
  guardian_phone: z.string().trim().min(8).max(24),
  program_id: z.string().uuid().optional(),
  class_id: z.string().uuid().optional(),
});

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const parsed = studentSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/santri?error=Data%20santri%20belum%20valid");

  const { error } = await supabase.from("students").insert({
    ...parsed.data,
    public_code: parsed.data.public_code.toUpperCase(),
    nickname: parsed.data.nickname || null,
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
