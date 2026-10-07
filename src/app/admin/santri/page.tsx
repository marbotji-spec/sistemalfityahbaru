import { requireRole } from "@/lib/auth/authorization";
import { createStudent, updateStudentName } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string; program?: string; branch?: string }>;
}
interface ProgramRelation { name: string }
function relationName(value: ProgramRelation | ProgramRelation[] | null) {
  return Array.isArray(value) ? value[0]?.name ?? "Belum ditentukan" : value?.name ?? "Belum ditentukan";
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const { supabase, roles } = await requireRole(["ADMIN", "GURU", "GURU_TPA", "GURU_TAHFIDZH", "KETUA_YAYASAN", "KETUA_TPA", "KETUA_TAHFIDZH"]);
  const isAdminOrChair = roles.some((role) => role === "ADMIN" || role === "KETUA_YAYASAN");
  const canEditTpaNames = roles.some((role) => ["ADMIN", "GURU", "GURU_TPA", "KETUA_TPA"].includes(role));
  const [{ data: programs }, { data: rawStudents }] = await Promise.all([
    supabase.from("programs").select("id, name").eq("is_active", true).order("name"),
    supabase.from("students").select("id, nis, public_code, full_name, gender, status, branch, program_id, programs(name)").order("created_at", { ascending: false }),
  ]);
  const selectedProgram = programs?.find((item) => item.id === params.program || item.name.toUpperCase() === params.program?.toUpperCase());
  const branchFilter = isAdminOrChair && ["GOWA", "BARRU", "BULUKUMBA"].includes(params.branch ?? "") ? params.branch : null;
  const students = (rawStudents ?? []).filter((student) => {
    const name = relationName(student.programs as ProgramRelation | ProgramRelation[] | null).toUpperCase();
    const roleAllows = isAdminOrChair
      || (roles.some((role) => ["GURU", "GURU_TPA", "KETUA_TPA"].includes(role)) && name.includes("TPA"))
      || (roles.some((role) => ["GURU", "GURU_TAHFIDZH", "KETUA_TAHFIDZH"].includes(role)) && name.includes("TAHFIDZH"));
    return roleAllows && (!selectedProgram || student.program_id === selectedProgram.id) && (!branchFilter || student.branch === branchFilter);
  });

  return (
    <main className="min-h-screen bg-[#eef7fc] px-5 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-7 rounded-xl bg-[#147fbd] p-6 text-white">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#bfe9ff]">Data santri</p>
          <h1 className="mt-2 text-3xl font-bold">{selectedProgram?.name ?? "Semua program"}{branchFilter ? ` · ${branchFilter === "GOWA" ? "Gowa (Pusat)" : branchFilter}` : ""}</h1>
          <p className="mt-2 text-white/85">Kelola santri sesuai program dan cabang.</p>
        </header>
        {params.error && <p className="mb-4 rounded-lg bg-[#fff1f2] p-3 text-sm font-medium text-[#c91d2e]">{params.error}</p>}
        {params.success && <p className="mb-4 rounded-lg bg-[#effaf5] p-3 text-sm font-medium text-[#087443]">{params.success}</p>}
        <nav className="mb-5 flex flex-wrap gap-2">
          <a href="/admin/santri" className="rounded-lg border border-[#147fbd] bg-white px-3 py-2 text-sm font-semibold text-[#147fbd]">Semua program</a>
          <a href="/admin/santri?program=TPA" className="rounded-lg border border-[#147fbd] bg-white px-3 py-2 text-sm font-semibold text-[#147fbd]">TPA</a>
          <a href="/admin/santri?program=TAHFIDZH" className="rounded-lg border border-[#147fbd] bg-white px-3 py-2 text-sm font-semibold text-[#147fbd]">TAHFIDZH</a>
          {isAdminOrChair && <><a href="/admin/santri?branch=GOWA" className="rounded-lg border border-[#c8d7e3] bg-white px-3 py-2 text-sm text-[#112b45]">Gowa</a><a href="/admin/santri?branch=BARRU" className="rounded-lg border border-[#c8d7e3] bg-white px-3 py-2 text-sm text-[#112b45]">Barru</a><a href="/admin/santri?branch=BULUKUMBA" className="rounded-lg border border-[#c8d7e3] bg-white px-3 py-2 text-sm text-[#112b45]">Bulukumba</a></>}
        </nav>
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-xl border border-[#c8d7e3] bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[#112b45]">Tambah santri</h2>
            <form action={createStudent} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-[#112b45]">Nama lengkap *<input name="full_name" required className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">NIS (opsional)<input name="nis" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Nama panggilan<input name="nickname" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Jenis kelamin<select name="gender" defaultValue="" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm"><option value="">Belum diisi</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
              <label className="block text-sm font-semibold text-[#112b45]">Nama wali<input name="guardian_name" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Nomor wali<input name="guardian_phone" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Program<select name="program_id" defaultValue={selectedProgram?.id ?? ""} className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] bg-white px-3 py-2 text-sm"><option value="">Pilih program</option>{programs?.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label>
              {!isAdminOrChair && <input type="hidden" name="branch" value="GOWA" />}
              {isAdminOrChair && <label className="block text-sm font-semibold text-[#112b45]">Cabang<select name="branch" defaultValue={branchFilter ?? "GOWA"} className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] bg-white px-3 py-2 text-sm"><option value="GOWA">Gowa (Pusat)</option><option value="BARRU">Barru</option><option value="BULUKUMBA">Bulukumba</option></select></label>}
              <button className="w-full rounded-lg bg-[#e52335] px-4 py-2.5 text-sm font-bold text-white">Simpan santri</button>
            </form>
          </section>
          <section className="overflow-hidden rounded-xl border border-[#c8d7e3] bg-white">
            <div className="border-b border-[#d8e3ec] px-5 py-4"><h2 className="font-bold text-[#112b45]">Daftar santri</h2><p className="mt-1 text-sm text-slate-500">{students.length} data pada filter ini</p></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f7fafc] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Nama</th><th className="px-4 py-3">NIS</th><th className="px-4 py-3">Program</th><th className="px-4 py-3">Cabang</th><th className="px-4 py-3">Kode publik</th><th className="px-4 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-[#d8e3ec]">{students.map((student) => { const rel = student.programs as ProgramRelation | ProgramRelation[] | null; const tpaProgram = relationName(rel).toUpperCase() === "TPA"; return <tr key={student.id}><td className="px-4 py-3 font-semibold text-[#112b45]">{student.full_name}</td><td className="px-4 py-3">{student.nis ?? "-"}</td><td className="px-4 py-3">{relationName(rel)}</td><td className="px-4 py-3">{student.branch === "GOWA" ? "Gowa (Pusat)" : student.branch}</td><td className="px-4 py-3 text-xs font-semibold text-[#147fbd]">{student.public_code}</td><td className="px-4 py-3">{canEditTpaNames && student.branch === "GOWA" && tpaProgram && <details><summary className="cursor-pointer font-bold text-[#147fbd]">Edit nama</summary><form action={updateStudentName} className="mt-2 flex gap-2"><input type="hidden" name="student_id" value={student.id} /><input name="full_name" defaultValue={student.full_name} required minLength={2} maxLength={120} className="w-36 rounded border border-[#c8d7e3] px-2 py-1 text-xs" /><button className="rounded bg-[#e52335] px-2 py-1 text-xs font-bold text-white">Simpan</button></form></details>}</td></tr>; })}</tbody></table></div>
          </section>
        </div>
      </div>
    </main>
  );
}
