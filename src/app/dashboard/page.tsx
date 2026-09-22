import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/lib/auth/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("full_name, role").eq("id", user.id).maybeSingle();

  return (
    <main className="min-h-screen bg-[#eef7fc]">
      <header className="border-b border-white/20 bg-[#147fbd] px-5 py-4 text-white lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div><p className="text-sm font-bold uppercase tracking-[0.18em] text-white">Yayasan Al-Fityah</p><h1 className="mt-1 text-xl font-bold text-white">Dashboard {profile?.role ?? "Internal"}</h1></div>
          <form action={logout}><button className="rounded-lg bg-[#e52335] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c91d2e]">Keluar</button></form>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        {profileError && <div className="mb-6 rounded-lg border border-[#f3b5bc] bg-[#fff1f2] p-4 text-sm text-[#9f1d2b]"><p className="font-bold">Profil belum dapat dimuat</p><p className="mt-1">Pastikan migration Supabase sudah dijalankan. Detail teknis: {profileError.message}</p></div>}
        {!profile && !profileError && <div className="mb-6 rounded-lg border border-[#f3b5bc] bg-[#fff1f2] p-4 text-sm text-[#9f1d2b]"><p className="font-bold">Akun belum memiliki profil aplikasi</p><p className="mt-1">Jalankan migration profiles atau hubungi admin yayasan.</p></div>}
        <p className="text-slate-500">Selamat datang, <span className="font-semibold text-[#112b45]">{profile?.full_name ?? user.email}</span>.</p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Data Santri", "/admin/santri"],
            ["Data Guru", "/admin/guru"],
            ["TPA & Tahfiz", "/admin/tpa"],
            ["Laporan", "/admin/aktivitas"]
          ].map(([label, href]) => (
            <article key={label} className="rounded-xl border border-[#c8d7e3] bg-white p-5 shadow-sm">
              <p className="text-sm font-semibold text-[#112b45]">{label}</p>
              <p className="mt-3 text-sm text-slate-500">Buka modul untuk melanjutkan pekerjaan.</p>
              <Link href={href} className="mt-5 inline-block rounded-md bg-[#e52335] px-3 py-2 text-sm font-bold text-white hover:bg-[#c91d2e]">Buka modul &rarr;</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
