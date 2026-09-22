import { login } from "@/lib/auth/actions";
import Image from "next/image";
import Link from "next/link";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#147fbd] px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border border-white/30 bg-white p-8 shadow-[0_16px_50px_rgba(7,53,82,0.25)]">
        <div className="mb-8">
          <Image src="/logo.svg" alt="Logo Yayasan Al-Fityah" width={72} height={72} className="mb-5 h-16 w-16 object-contain" />
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#147fbd]">Yayasan Al-Fityah</p>
          <h1 className="mt-3 text-2xl font-bold text-[#112b45]">Masuk ke sistem</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Gunakan akun internal yayasan untuk mengelola pendidikan Al-Qur&apos;an.</p>
        </div>
        {params.error && <p role="alert" className="mb-5 rounded-lg bg-[#fff1f2] p-3 text-sm font-medium text-[#c91d2e]">{params.error}</p>}
        <form action={login} className="space-y-5">
          <label className="block text-sm font-semibold text-[#112b45]">
            Email
            <input name="email" type="email" required autoComplete="email" className="mt-2 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 font-normal text-[#101820] outline-none transition focus:border-[#e52335] focus:ring-2 focus:ring-[#e52335]/15" placeholder="nama@yayasan.id" />
          </label>
          <label className="block text-sm font-semibold text-[#112b45]">
            Password
            <input name="password" type="password" required autoComplete="current-password" className="mt-2 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 font-normal text-[#101820] outline-none transition focus:border-[#e52335] focus:ring-2 focus:ring-[#e52335]/15" placeholder="Masukkan password" />
          </label>
          <button type="submit" className="w-full rounded-lg bg-[#e52335] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#c91d2e]">Masuk</button>
        </form>
        <Link href="/forgot-password" className="mt-5 block text-center text-sm font-semibold text-[#147fbd]">Lupa password?</Link>
      </section>
    </main>
  );
}
