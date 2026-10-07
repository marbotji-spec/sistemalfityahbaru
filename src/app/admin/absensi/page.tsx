import { requireRole } from "@/lib/auth/authorization";
import { saveStudentAttendanceBatch } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string; date?: string; session?: string; branch?: string }>;
}
interface ProgramRelation { name: string }
function programName(value: ProgramRelation | ProgramRelation[] | null) {
  return Array.isArray(value) ? value[0]?.name ?? "" : value?.name ?? "";
}

export default async function AttendancePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase, roles } = await requireRole(["ADMIN", "KETUA_YAYASAN", "GURU", "GURU_TPA", "GURU_TAHFIDZH", "KETUA_TPA", "KETUA_TAHFIDZH"]);
  const canManageAllBranches = roles.includes("ADMIN") || roles.includes("KETUA_YAYASAN");
  const canTpa = roles.some((role) => ["ADMIN", "KETUA_YAYASAN", "GURU", "GURU_TPA", "KETUA_TPA"].includes(role));
  const canTahfizh = roles.some((role) => ["ADMIN", "KETUA_YAYASAN", "GURU", "GURU_TAHFIDZH", "KETUA_TAHFIDZH"].includes(role));
  const branch = canManageAllBranches && ["GOWA", "BARRU", "BULUKUMBA"].includes(params.branch ?? "") ? params.branch! : "GOWA";
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : new Date().toISOString().slice(0, 10);
  const session = params.session?.trim() || "Sesi 1";
  const [{ data: rawStudents }, { data: existing }] = await Promise.all([
    supabase.from("students").select("id, full_name, public_code, branch, program_id, programs(name)").eq("status", "AKTIF").eq("branch", branch).order("full_name"),
    supabase.from("student_attendance").select("student_id, status, note").eq("attendance_date", date).eq("session_name", session),
  ]);
  const students = (rawStudents ?? []).filter((student) => {
    const name = programName(student.programs as ProgramRelation | ProgramRelation[] | null).toUpperCase();
    return (canTpa && name.includes("TPA")) || (canTahfizh && name.includes("TAHFIDZH"));
  });
  const existingByStudent = new Map((existing ?? []).map((row) => [row.student_id, row]));

  return (
    <main className="min-h-screen bg-[#eef7fc] px-5 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-xl bg-[#147fbd] p-6 text-white"><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#bfe9ff]">KEHADIRAN SANTRI</p><h1 className="mt-2 text-3xl font-bold">Absensi harian massal</h1><p className="mt-2 text-white/85">Satu tabel untuk seluruh santri pada cabang/program ini; simpan sekali dan gunakan tanggal/sesi sama untuk koreksi.</p></header>
        {params.error && <p className="mb-4 rounded-lg bg-[#fff1f2] p-3 text-sm font-medium text-[#c91d2e]">{params.error}</p>}
        {params.success && <p className="mb-4 rounded-lg bg-[#effaf5] p-3 text-sm font-medium text-[#087443]">{params.success}</p>}
        <form method="get" className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-[#c8d7e3] bg-white p-4">
          <label className="text-sm font-semibold text-[#112b45]">Tanggal<input name="date" type="date" required defaultValue={date} className="mt-1 block rounded-lg border border-[#c8d7e3] px-3 py-2 font-normal" /></label>
          <label className="text-sm font-semibold text-[#112b45]">Sesi<input name="session" required defaultValue={session} className="mt-1 block rounded-lg border border-[#c8d7e3] px-3 py-2 font-normal" /></label>
          {canManageAllBranches && <label className="text-sm font-semibold text-[#112b45]">Cabang<select name="branch" defaultValue={branch} className="mt-1 block rounded-lg border border-[#c8d7e3] bg-white px-3 py-2 font-normal"><option value="GOWA">Gowa (Pusat)</option><option value="BARRU">Barru</option><option value="BULUKUMBA">Bulukumba</option></select></label>}
          <button className="rounded-lg border border-[#147fbd] px-4 py-2 text-sm font-bold text-[#147fbd]">Tampilkan daftar</button><span className="ml-auto text-sm text-slate-500">{students.length} santri aktif · {branch}</span>
        </form>
        <form action={saveStudentAttendanceBatch}>
          <input type="hidden" name="attendance_date" value={date} /><input type="hidden" name="session_name" value={session} /><input type="hidden" name="branch" value={branch} />
          <div className="overflow-x-auto rounded-xl border border-[#c8d7e3] bg-white"><table className="w-full min-w-[970px] text-left text-sm"><thead className="bg-[#f7fafc] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">No.</th><th className="px-4 py-3">Nama santri</th><th className="px-4 py-3">Program</th><th className="px-4 py-3">Hadir</th><th className="px-4 py-3">Sakit</th><th className="px-4 py-3">Izin</th><th className="px-4 py-3">Alpa</th><th className="px-4 py-3">Keterangan</th></tr></thead><tbody className="divide-y divide-[#d8e3ec]">{students.map((student, index) => { const old = existingByStudent.get(student.id); const name = student.full_name; return <tr key={student.id}><td className="px-4 py-3 text-slate-500">{index + 1}<input type="hidden" name="student_id" value={student.id} /></td><td className="px-4 py-3"><span className="font-semibold text-[#112b45]">{name}</span><span className="ml-2 text-xs text-slate-500">{student.public_code}</span></td><td className="px-4 py-3">{programName(student.programs as ProgramRelation | ProgramRelation[] | null)}</td>{(["HADIR", "SAKIT", "IZIN", "ALPA"] as const).map((status) => <td key={status} className="px-4 py-3 text-center"><input type="radio" required name={`status_${student.id}`} value={status} defaultChecked={old?.status === status || (!old && status === "HADIR")} aria-label={`${name} ${status}`} className="h-4 w-4 accent-[#147fbd]" /></td>)}<td className="px-4 py-2"><input name={`note_${student.id}`} defaultValue={old?.note ?? ""} aria-label={`Keterangan ${name}`} className="w-full rounded border border-[#d8e3ec] px-2 py-1.5 text-sm" placeholder="Opsional" /></td></tr>; })}</tbody></table>{students.length === 0 && <p className="p-8 text-center text-slate-500">Tidak ada santri aktif pada cabang/program ini.</p>}</div>
          <div className="sticky bottom-0 mt-4 flex justify-end rounded-xl border border-[#c8d7e3] bg-white/95 p-4 shadow-lg backdrop-blur"><button disabled={!students.length} className="rounded-lg bg-[#e52335] px-6 py-3 text-sm font-bold text-white hover:bg-[#c91d2e] disabled:opacity-50">Simpan semua absensi</button></div>
        </form>
      </div>
    </main>
  );
}
