import { createClient } from "@/lib/supabase/server";
import { createStudent } from "./actions";

interface PageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

interface ProgramRelation {
  name: string;
}

function programName(value: ProgramRelation | ProgramRelation[] | null) {
  return Array.isArray(value) ? value[0]?.name ?? "Belum ditentukan" : value?.name ?? "Belum ditentukan";
}

export default async function StudentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const [{ data: students }, { data: programs }] = await Promise.all([
    supabase.from("students").select("id, nis, public_code, full_name, gender, status, programs(name)").order("created_at", { ascending: false }),
    supabase.from("programs").select("id, name").eq("is_active", true).order("name"),
  ]);

  return (
    <main className="min-h-screen bg-[#f7fafc] px-5 py-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#147fbd]">Administrasi</p><h1 className="mt-2 text-3xl font-bold text-[#112b45]">Data santri</h1><p className="mt-2 text-slate-500">Nama wajib. NIS dan data lainnya dapat dilengkapi kemudian.</p></div>
        {params.error && <p className="mb-4 rounded-lg bg-[#fff1f2] p-3 text-sm font-medium text-[#c91d2e]">{params.error}</p>}
        {params.success && <p className="mb-4 rounded-lg bg-[#effaf5] p-3 text-sm font-medium text-[#087443]">{params.success}</p>}
        <div className="grid gap-8 xl:grid-cols-[360px_1fr]">
          <section className="h-fit rounded-xl border border-[#d8e3ec] bg-white p-5 shadow-sm">
            <h2 className="font-bold text-[#112b45]">Tambah santri</h2>
            <form action={createStudent} className="mt-5 space-y-4">
              <label className="block text-sm font-semibold text-[#112b45]">Nama lengkap *<input name="full_name" required className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">NIS (opsional)<input name="nis" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Nama panggilan<input name="nickname" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Jenis kelamin<select name="gender" defaultValue="" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal"><option value="">Belum diisi</option><option value="L">Laki-laki</option><option value="P">Perempuan</option></select></label>
              <label className="block text-sm font-semibold text-[#112b45]">Nama wali<input name="guardian_name" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Nomor wali<input name="guardian_phone" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal" /></label>
              <label className="block text-sm font-semibold text-[#112b45]">Program<select name="program_id" defaultValue="" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2 text-sm font-normal"><option value="">Belum ditentukan</option>{programs?.map((program) => <option key={program.id} value={program.id}>{program.name}</option>)}</select></label>
              <button className="w-full rounded-lg bg-[#e52335] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c91d2e]">Simpan santri</button>
            </form>
          </section>
          <section className="rounded-xl border border-[#d8e3ec] bg-white shadow-sm">
            <div className="border-b border-[#d8e3ec] px-5 py-4"><h2 className="font-bold text-[#112b45]">Daftar santri</h2><p className="mt-1 text-sm text-slate-500">{students?.length ?? 0} data tersimpan</p></div>
            <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-[#f7fafc] text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Santri</th><th className="px-5 py-3">NIS</th><th className="px-5 py-3">Program</th><th className="px-5 py-3">Kode publik</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#d8e3ec]">{students?.map((student) => <tr key={student.id}><td className="px-5 py-4 font-semibold text-[#112b45]">{student.full_name}</td><td className="px-5 py-4 text-slate-600">{student.nis ?? "Belum diisi"}</td><td className="px-5 py-4 text-slate-600">{programName(student.programs as ProgramRelation | ProgramRelation[] | null)}</td><td className="px-5 py-4 text-xs font-semibold text-[#147fbd]">{student.public_code}</td><td className="px-5 py-4"><span className="rounded-full bg-[#effaf5] px-2.5 py-1 text-xs font-semibold text-[#087443]">{student.status}</span></td></tr>)}</tbody></table></div>
          </section>
        </div>
      </div>
    </main>
  );
}
