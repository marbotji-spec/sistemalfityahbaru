"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const batchSchema = z.object({
  attendance_date: z.string().date(),
  session_name: z.string().trim().min(1).max(60),
  branch: z.enum(["GOWA", "BARRU", "BULUKUMBA"]),
});
const statuses = ["HADIR", "SAKIT", "IZIN", "ALPA"] as const;

export async function saveStudentAttendanceBatch(formData: FormData) {
  const { supabase, user, roles } = await requireRole(["ADMIN", "KETUA_YAYASAN", "GURU", "GURU_TPA", "GURU_TAHFIDZH", "KETUA_TPA", "KETUA_TAHFIDZH"]);
  const parsed = batchSchema.safeParse({ attendance_date: formData.get("attendance_date"), session_name: formData.get("session_name"), branch: formData.get("branch") || "GOWA" });
  if (!parsed.success) redirect("/admin/absensi?error=Tanggal%20atau%20sesi%20tidak%20valid");
  const ids = [...new Set(formData.getAll("student_id").map(String))];
  if (ids.length === 0) redirect("/admin/absensi?error=Tidak%20ada%20santri%20di%20daftar");

  const canManageAllBranches = roles.includes("ADMIN") || roles.includes("KETUA_YAYASAN");
  const branch = canManageAllBranches ? parsed.data.branch : "GOWA";
  const { data: students } = await supabase.from("students").select("id, program_id, class_id, branch").in("id", ids).eq("status", "AKTIF").eq("branch", branch);
  if (!students || students.length !== ids.length) redirect("/admin/absensi?error=Daftar%20santri%20tidak%20sesuai%20cabang%20yang%20diizinkan");

  const { data: previous } = await supabase.from("student_attendance").select("student_id, created_by").eq("attendance_date", parsed.data.attendance_date).eq("session_name", parsed.data.session_name).in("student_id", ids);
  const previousCreator = new Map((previous ?? []).map((row) => [row.student_id, row.created_by]));
  const rows = students.map((student) => {
    const status = String(formData.get(`status_${student.id}`) ?? "");
    if (!statuses.includes(status as typeof statuses[number])) redirect("/admin/absensi?error=Pilih%20status%20untuk%20semua%20santri");
    const note = String(formData.get(`note_${student.id}`) ?? "").trim();
    return {
      student_id: student.id,
      program_id: student.program_id,
      class_id: student.class_id,
      attendance_date: parsed.data.attendance_date,
      session_name: parsed.data.session_name,
      status,
      note: note || null,
      created_by: previousCreator.get(student.id) ?? user.id,
      updated_by: user.id,
    };
  });
  const { error } = await supabase.from("student_attendance").upsert(rows, { onConflict: "student_id,attendance_date,session_name" });
  if (error) redirect(`/admin/absensi?error=${encodeURIComponent("Absensi massal gagal disimpan; migration koreksi mungkin belum dijalankan")}`);
  revalidatePath("/admin/absensi");
  revalidatePath("/dashboard");
  redirect("/admin/absensi?success=Absensi%20harian%20berhasil%20disimpan%20atau%20dikoreksi");
}
