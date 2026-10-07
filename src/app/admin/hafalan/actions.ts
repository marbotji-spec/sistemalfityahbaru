"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const optionalInt = z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().int().positive().optional());
const optionalScore = z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().int().min(1).max(100).optional());
const memorizationSchema = z.object({
  student_id: z.string().uuid(),
  session_date: z.string().date(),
  session_type: z.enum(["ZIYADAH", "MURAJAAH"]),
  surah_name: z.string().trim().min(1).max(100),
  verse_start: z.coerce.number().int().positive(),
  verse_end: z.coerce.number().int().positive(),
  page_start: optionalInt,
  page_end: optionalInt,
  fluency_score: optionalScore,
  tajwid_score: optionalScore,
  makhraj_score: optionalScore,
  overall_score: z.coerce.number().int().min(1).max(100),
  teacher_note: z.string().trim().max(1000).optional(),
}).refine((data) => data.verse_end >= data.verse_start, { path: ["verse_end"], message: "Ayat akhir harus >= ayat awal" });

export async function createMemorizationRecord(formData: FormData) {
  const { supabase, user, roles } = await requireRole(["ADMIN", "GURU", "GURU_TAHFIDZH", "KETUA_TAHFIDZH"]);
  const parsed = memorizationSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/hafalan?error=Periksa%20surah%2C%20rentang%20ayat%2C%20dan%20nilai%201-100");

  let studentQuery = supabase.from("students").select("program_id, class_id, branch").eq("id", parsed.data.student_id);
  if (!roles.includes("ADMIN")) studentQuery = studentQuery.eq("branch", "GOWA");
  const { data: student } = await studentQuery.single();
  if (!student) redirect("/admin/hafalan?error=Santri%20tidak%20ditemukan");
  const { error } = await supabase.from("memorization_records").insert({
    ...parsed.data,
    program_id: student.program_id,
    class_id: student.class_id,
    created_by: user.id,
    teacher_note: parsed.data.teacher_note || null,
  });
  if (error) redirect(`/admin/hafalan?error=${encodeURIComponent("Riwayat setoran gagal disimpan")}`);
  revalidatePath("/admin/hafalan");
  redirect("/admin/hafalan?success=Riwayat%20setoran%20tersimpan");
}
