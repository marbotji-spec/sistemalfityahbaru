import Image from "next/image";
import Link from "next/link";

const stats = [
  ["148", "Santri aktif", "Naik 12% semester ini"],
  ["12", "Guru pengajar", "TPA dan Tahfiz"],
  ["9", "Kelas berjalan", "Senin - Sabtu"],
  ["94%", "Kehadiran", "Bulan ini"],
];

const activities = [
  ["Hari ini, 08:30", "Setoran hafalan", "Kelas Tahfiz A", "12 santri"],
  ["Hari ini, 10:00", "Pembelajaran TPA", "Kelas TPA B", "18 santri"],
  ["Besok, 16:00", "Evaluasi bacaan", "Halaqah Al-Ikhlas", "9 santri"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7fafc]">
      <header className="border-b border-[#d8e3ec] bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Logo Yayasan Al-Fityah" width={54} height={54} className="h-12 w-12 object-contain" priority />
            <div><p className="text-base font-bold tracking-wide text-[#147fbd]">YAYASAN AL FITYAH</p><p className="text-xs text-slate-500">Pendidikan Al-Qur&apos;an</p></div>
          </div>
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"><a className="text-[#147fbd]" href="#ringkasan">Ringkasan</a><a className="hover:text-[#147fbd]" href="#aktivitas">Aktivitas</a><a className="hover:text-[#147fbd]" href="#program">Program</a></nav>
          <Link href="/login" className="rounded-lg bg-[#e52335] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#c91d2e]">Masuk sistem</Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 lg:px-10 lg:py-10">
        <div className="mb-9 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#e52335]">Selamat datang kembali</p><h1 className="text-3xl font-bold tracking-tight text-[#112b45] sm:text-4xl">Ringkasan yayasan</h1><p className="mt-2 text-slate-500">Pantau kegiatan pendidikan Al-Qur&apos;an hari ini dengan mudah.</p></div><div className="rounded-lg border border-[#d8e3ec] bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#1687c9]" />Senin, 21 September 2026</div></div>

        <section id="ringkasan" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map(([value, label, note]) => <article key={label} className="rounded-xl border border-[#d8e3ec] bg-white p-5 shadow-[0_2px_8px_rgba(17,43,69,0.04)]"><p className="text-sm font-medium text-slate-500">{label}</p><p className="mt-3 text-3xl font-bold text-[#112b45]">{value}</p><p className="mt-2 text-xs font-medium text-[#1687c9]">{note}</p></article>)}</section>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <section id="aktivitas" className="rounded-xl border border-[#d8e3ec] bg-white shadow-[0_2px_8px_rgba(17,43,69,0.04)]"><div className="flex items-center justify-between border-b border-[#d8e3ec] px-5 py-4"><div><h2 className="font-bold text-[#112b45]">Aktivitas mendatang</h2><p className="mt-1 text-sm text-slate-500">Jadwal pembelajaran dan setoran</p></div><Link href="/admin/aktivitas" className="text-sm font-semibold text-[#147fbd] hover:text-[#e52335]">Lihat semua</Link></div><div className="divide-y divide-[#d8e3ec]">{activities.map(([time, title, group, count]) => <Link href={title === "Setoran hafalan" ? "/admin/hafalan" : "/admin/absensi"} key={title} className="flex items-center gap-4 px-5 py-4 transition hover:bg-[#f7fafc]"><div className="h-11 w-1 rounded-full bg-[#e52335]" /><div className="min-w-0 flex-1"><p className="text-xs font-medium text-[#1687c9]">{time}</p><p className="mt-1 font-semibold text-[#112b45]">{title}</p><p className="text-sm text-slate-500">{group}</p></div><span className="text-sm font-medium text-slate-500">{count}</span></Link>)}</div></section>

          <section id="program" className="rounded-xl border border-[#d8e3ec] bg-[#112b45] p-6 text-white shadow-[0_2px_8px_rgba(17,43,69,0.08)]"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#5fc0f2]">Program utama</p><h2 className="mt-3 text-2xl font-bold">Tumbuh bersama Al-Qur&apos;an</h2><p className="mt-3 text-sm leading-6 text-slate-300">Kelola perkembangan TPA dan Tahfiz dengan catatan yang rapi, terukur, dan mudah dipantau.</p><div className="mt-7 space-y-3">{[["TPA Al-Fityah", "/admin/tpa"], ["Tahfiz Al-Qur'an", "/admin/hafalan"]].map(([program, href]) => <Link href={href} key={program} className="flex items-center justify-between rounded-lg bg-white/10 px-4 py-3 text-sm transition hover:bg-white/20"><span>{program}</span><span className="text-[#5fc0f2]">&rarr;</span></Link>)}</div></section>
        </div>

        <section className="mt-8 rounded-xl border border-[#d8e3ec] bg-white p-6 shadow-[0_2px_8px_rgba(17,43,69,0.04)]"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><h2 className="font-bold text-[#112b45]">Aksi cepat</h2><p className="mt-1 text-sm text-slate-500">Mulai pekerjaan administrasi hari ini</p></div><div className="grid gap-3 sm:grid-cols-3"><Link href="/admin/santri" className="rounded-lg bg-[#e52335] px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-[#c91d2e]">Tambah santri</Link><Link href="/admin/absensi" className="rounded-lg border border-[#1687c9] px-4 py-2.5 text-center text-sm font-semibold text-[#147fbd] hover:bg-[#edf8fe]">Input absensi</Link><Link href="/admin/hafalan" className="rounded-lg border border-[#1687c9] px-4 py-2.5 text-center text-sm font-semibold text-[#147fbd] hover:bg-[#edf8fe]">Catat hafalan</Link></div></div></section>
      </div>
    </main>
  );
}
