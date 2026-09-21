export default function Home() {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-6xl flex-col justify-center px-6 py-16 lg:px-12">
      <div className="max-w-3xl">
        <p className="mb-6 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Yayasan Pendidikan Al-Qur&apos;an
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-emerald-950 sm:text-6xl">
          Sistem manajemen yang menjaga amanah pendidikan.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          Fondasi digital untuk mengelola santri, guru, pembelajaran TPA,
          tahfiz, absensi, capaian, dan laporan yayasan secara terarah.
        </p>
      </div>
      <div className="mt-14 grid gap-4 sm:grid-cols-3">
        {[
          ["01", "Data terpusat", "Santri, guru, kelas, dan program dalam satu sistem."],
          ["02", "Pembelajaran terukur", "Catat bacaan, hafalan, penilaian, dan perkembangan."],
          ["03", "Laporan terpercaya", "Pantau capaian dan operasional yayasan dengan jelas."],
        ].map(([number, title, description]) => (
          <section key={number} className="border-t border-emerald-900/15 pt-5">
            <span className="text-sm font-semibold text-amber-600">{number}</span>
            <h2 className="mt-3 text-xl font-semibold text-emerald-950">{title}</h2>
            <p className="mt-2 leading-7 text-slate-600">{description}</p>
          </section>
        ))}
      </div>
    </main>
  );
}
