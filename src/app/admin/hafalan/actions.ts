"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const optionalInt = z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().int().positive().optional());
const optionalScore = z.preprocess((value) => value === "" || value == null ? undefined : Number(value), z.number().int().min(1).max(100).optional());
const recordSchema = z.object({
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

async function getAuthorizedStudent(supabase: Awaited<ReturnType<typeof requireRole>>["supabase"], studentId: string, roles: string[]) {
  let query = supabase.from("students").select("program_id, class_id, branch").eq("id", studentId);
  if (!roles.includes("ADMIN") && !roles.includes("KETUA_YAYASAN")) query = query.eq("branch", "GOWA");
  return query.maybeSingle();
}

export async function createMemorizationRecord(formData: FormData) {
  const { supabase, user, roles } = await requireRole(["ADMIN", "GURU", "GURU_TAHFIDZH", "KETUA_TAHFIDZH"]);
  const parsed = recordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/hafalan?error=Periksa%20surah%2C%20rentang%20ayat%2C%20dan%20nilai%201-100");
  const { data: student } = await getAuthorizedStudent(supabase, parsed.data.student_id, roles);
  if (!student) redirect("/admin/hafalan?error=Santri%20tidak%20ditemukan%20dalam%20cakupan%20akses");
  const { error } = await supabase.from("memorization_records").insert({ ...parsed.data, program_id: student.program_id, class_id: student.class_id, created_by: user.id, teacher_note: parsed.data.teacher_note || null });
  if (error) redirect("/admin/hafalan?error=Riwayat%20setoran%20gagal%20disimpan");
  revalidatePath("/admin/hafalan");
  redirect("/admin/hafalan?success=Riwayat%20setoran%20tersimpan");
}

export async function updateMemorizationRecord(formData: FormData) {
  const { supabase, roles } = await requireRole(["ADMIN", "KETUA_YAYASAN", "GURU", "GURU_TAHFIDZH", "KETUA_TAHFIDZH"]);
  const recordId = String(formData.get("record_id") ?? "");
  const parsed = recordSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!z.string().uuid().safeParse(recordId).success || !parsed.success) redirect("/admin/hafalan?error=Data%20koreksi%20tidak%20valid");
  const { data: student } = await getAuthorizedStudent(supabase, parsed.data.student_id, roles);
  if (!student) redirect("/admin/hafalan?error=Santri%20tidak%20ditemukan%20dalam%20cakupan%20akses");
  const { student_id, ...values } = parsed.data;
  const { error } = await supabase.from("memorization_records").update({ ...values, teacher_note: values.teacher_note || null }).eq("id", recordId).eq("student_id", student_id);
  if (error) redirect("/admin/hafalan?error=Koreksi%20setoran%20gagal%20disimpan");
  revalidatePath("/admin/hafalan");
  redirect("/admin/hafalan?success=Setoran%20berhasil%20dikoreksi");
}
