"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireRole } from "@/lib/auth/authorization";

const attendanceSchema = z.object({
  student_id: z.string().uuid(),
  attendance_date: z.string().date(),
  session_name: z.string().trim().min(1).max(60),
  status: z.enum(["HADIR", "IZIN", "SAKIT", "ALPA"]),
  note: z.string().trim().max(500).optional(),
});

export async function saveStudentAttendance(formData: FormData) {
  const { supabase, user } = await requireRole(["ADMIN", "GURU", "GURU_TPA", "GURU_TAHFIDZH", "KETUA_TPA", "KETUA_TAHFIDZH"]);
  const parsed = attendanceSchema.safeParse(Object.fromEntries(formData.entries()));
  if (!parsed.success) redirect("/admin/absensi?error=Data%20absensi%20belum%20valid");

  const { data: student } = await supabase.from("students").select("program_id, class_id").eq("id", parsed.data.student_id).single();
  if (!student) redirect("/admin/absensi?error=Santri%20tidak%20ditemukan");
  const { error } = await supabase.from("student_attendance").upsert({
    ...parsed.data,
    program_id: student.program_id,
    class_id: student.class_id,
    note: parsed.data.note || null,
    created_by: user.id,
    updated_by: user.id,
  }, { onConflict: "student_id,attendance_date,session_name" });
  if (error) redirect(`/admin/absensi?error=${encodeURIComponent("Absensi gagal disimpan")}`);
  revalidatePath("/admin/absensi");
  redirect("/admin/absensi?success=Absensi%20santri%20tersimpan");
}
