"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const optionalInt = z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().int().positive().optional());
const optionalScore = z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().int().min(1).max(100).optional());
const readingSchema = z.object({
  student_id: z.string().uuid(),
  assessment_date: z.string().date(),
  material_type: z.enum(["IQRA", "QURAN"]),
  iqra_level: z.string().trim().max(40).optional(),
  page_start: optionalInt,
  page_end: optionalInt,
  surah_name: z.string().trim().max(100).optional(),
  verse_start: optionalInt,
  verse_end: optionalInt,
  fluency_score: optionalScore,
  tajwid_score: optionalScore,
  makhraj_score: optionalScore,
  length_score: optionalScore,
  waqaf_score: optionalScore,
  adab_score: optionalScore,
  overall_score: z.coerce.number().int().min(1).max(100),
  teacher_note: z.string().trim().max(1000).optional(),
});

export async function createReadingAssessment(formData: FormData) {
  const { supabase, user, roles } = await requireRole(["ADMIN", "GURU", "GURU_TPA", "KETUA_TPA"]);
  const parsed = readingSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/tpa?error=Periksa%20kembali%20data%20dan%20nilai%201-100");

  let studentQuery = supabase.from("students").select("program_id, class_id, branch").eq("id", parsed.data.student_id);
  if (!roles.includes("ADMIN")) studentQuery = studentQuery.eq("branch", "GOWA");
  const { data: student } = await studentQuery.single();
  if (!student) redirect("/admin/tpa?error=Santri%20tidak%20ditemukan");
  const { error } = await supabase.from("reading_assessments").insert({
    ...parsed.data,
    program_id: student.program_id,
    class_id: student.class_id,
    created_by: user.id,
    iqra_level: parsed.data.iqra_level || null,
    surah_name: parsed.data.surah_name || null,
    teacher_note: parsed.data.teacher_note || null,
  });
  if (error) redirect(`/admin/tpa?error=${encodeURIComponent("Penilaian gagal disimpan")}`);
  revalidatePath("/admin/tpa");
  redirect("/admin/tpa?success=Penilaian%20bacaan%20tersimpan");
}
