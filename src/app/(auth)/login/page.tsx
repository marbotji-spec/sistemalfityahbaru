import { login } from "@/lib/auth/actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-[#d8e3ec] bg-white p-8 shadow-[0_12px_40px_rgba(17,43,69,0.08)]">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#147fbd]">Yayasan Al-Fityah</p>
          <h1 className="mt-3 text-2xl font-bold text-[#112b45]">Masuk ke sistem</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan akun internal yayasan untuk mengelola pendidikan Al-Qur&apos;an.</p>
        </div>
        <form action={login} className="space-y-5">
          <label className="block text-sm font-semibold text-[#112b45]">
            Email
            <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 font-normal outline-none transition focus:border-[#1687c9] focus:ring-2 focus:ring-[#1687c9]/15" placeholder="nama@yayasan.id" />
          </label>
          <label className="block text-sm font-semibold text-[#112b45]">
            Password
            <input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 font-normal outline-none transition focus:border-[#1687c9] focus:ring-2 focus:ring-[#1687c9]/15" placeholder="Masukkan password" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-[#e52335] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#c91d2e]">Masuk</button>
        </form>
      </section>
    </main>
  );
}
