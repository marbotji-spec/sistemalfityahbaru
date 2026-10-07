"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const batchSchema = z.object({
  attendance_date: z.string().date(),
  session_name: z.string().trim().min(1).max(60),
});
const statusValues = new Set(["HADIR", "SAKIT", "IZIN", "ALPA", "CUTI"]);

export async function saveTeacherAttendanceBatch(formData: FormData) {
  const { supabase, user } = await requireRole(["ADMIN", "KETUA_YAYASAN"]);
  const parsed = batchSchema.safeParse({ attendance_date: formData.get("attendance_date"), session_name: formData.get("session_name") });
  if (!parsed.success) redirect("/admin/absensi-guru?error=Tanggal%20atau%20sesi%20tidak%20valid");
  const teacherIds = [...new Set(formData.getAll("teacher_id").map(String))];
  if (!teacherIds.length) redirect("/admin/absensi-guru?error=Tidak%20ada%20guru%20di%20daftar");

  const { data: teachers } = await supabase.from("profiles").select("id").in("id", teacherIds);
  if (!teachers || teachers.length !== teacherIds.length) redirect("/admin/absensi-guru?error=Daftar%20guru%20tidak%20valid");
  const existing = await supabase.from("teacher_attendance").select("teacher_id, created_by").eq("attendance_date", parsed.data.attendance_date).eq("session_name", parsed.data.session_name).in("teacher_id", teacherIds);
  const existingCreators = new Map((existing.data ?? []).map((item) => [item.teacher_id, item.created_by]));
  const rows = teacherIds.map((teacherId) => {
    const status = String(formData.get(`status_${teacherId}`) ?? "");
    if (!statusValues.has(status)) redirect("/admin/absensi-guru?error=Status%20absensi%20guru%20tidak%20valid");
    const note = String(formData.get(`note_${teacherId}`) ?? "").trim();
    return {
      teacher_id: teacherId,
      attendance_date: parsed.data.attendance_date,
      session_name: parsed.data.session_name,
      status,
      method: "MANUAL",
      note: note || null,
      created_by: existingCreators.get(teacherId) ?? user.id,
      updated_by: user.id,
    };
  });
  const { error } = await supabase.from("teacher_attendance").upsert(rows, { onConflict: "teacher_id,attendance_date,session_name" });
  if (error) redirect(`/admin/absensi-guru?error=${encodeURIComponent("Absensi guru gagal disimpan")}`);
  revalidatePath("/admin/absensi-guru");
  revalidatePath("/dashboard");
  redirect("/admin/absensi-guru?success=Absensi%20guru%20berhasil%20disimpan%20atau%20dikoreksi");
}
