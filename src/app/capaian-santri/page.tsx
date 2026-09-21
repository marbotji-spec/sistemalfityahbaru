"use client";

import { useState } from "react";

interface Achievement {
  student_name: string;
  program_name: string | null;
  class_name: string | null;
  period_label: string | null;
  attendance_present: number;
  attendance_excused: number;
  attendance_sick: number;
  attendance_absent: number;
  tpa_status: string | null;
  tajwid_summary: string | null;
  makhraj_summary: string | null;
  fluency_summary: string | null;
  memorization_total: string | null;
  last_surah: string | null;
  last_verse: string | null;
  memorization_status: string | null;
  payment_status: string | null;
  public_notes: { content: string; category: string | null }[];
}

export default function PublicAchievementPage() {
  const [code, setCode] = useState("");
  const [achievement, setAchievement] = useState<Achievement | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setAchievement(null);
    try {
      const response = await fetch(`/api/public-achievement?code=${encodeURIComponent(code)}`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setAchievement(result.data);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Capaian tidak ditemukan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7fafc] px-5 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="text-center"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#147fbd]">Yayasan Al-Fityah</p><h1 className="mt-3 text-3xl font-bold text-[#112b45]">Cek Capaian Santri</h1><p className="mx-auto mt-3 max-w-xl text-slate-500">Masukkan kode publik santri untuk melihat ringkasan perkembangan yang dibagikan yayasan.</p></div>
        <form onSubmit={handleLookup} className="mx-auto mt-8 flex max-w-xl gap-3 rounded-xl border border-[#d8e3ec] bg-white p-3 shadow-sm"><input value={code} onChange={(event) => setCode(event.target.value)} required className="min-w-0 flex-1 px-3 py-2 outline-none" placeholder="Contoh: TPA-2026-00125" aria-label="Kode santri" /><button disabled={loading} className="rounded-lg bg-[#e52335] px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">{loading ? "Memeriksa..." : "Cek capaian"}</button></form>
        {message && <p className="mx-auto mt-4 max-w-xl rounded-lg bg-[#fff1f2] p-4 text-center text-sm font-medium text-[#c91d2e]">{message}</p>}
        {achievement && <section className="mt-8 space-y-5"><div className="rounded-xl bg-[#112b45] p-6 text-white"><p className="text-sm text-[#5fc0f2]">{achievement.period_label}</p><h2 className="mt-2 text-2xl font-bold">{achievement.student_name}</h2><p className="mt-2 text-slate-300">{achievement.program_name ?? "Program"} · {achievement.class_name ?? "Kelas"}</p></div><div className="grid gap-5 sm:grid-cols-2"><article className="rounded-xl border border-[#d8e3ec] bg-white p-5"><h3 className="font-bold text-[#112b45]">Kehadiran</h3><div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600"><span>Hadir: <b>{achievement.attendance_present}</b></span><span>Izin: <b>{achievement.attendance_excused}</b></span><span>Sakit: <b>{achievement.attendance_sick}</b></span><span>Alpa: <b>{achievement.attendance_absent}</b></span></div></article><article className="rounded-xl border border-[#d8e3ec] bg-white p-5"><h3 className="font-bold text-[#112b45]">Tahfiz</h3><p className="mt-4 text-sm text-slate-600">Total hafalan: <b>{achievement.memorization_total ?? "Belum tersedia"}</b></p><p className="mt-2 text-sm text-slate-600">Surah terakhir: <b>{achievement.last_surah ?? "Belum tersedia"}</b></p><p className="mt-2 text-sm text-slate-600">Status: <b>{achievement.memorization_status ?? "Belum tersedia"}</b></p></article></div><article className="rounded-xl border border-[#d8e3ec] bg-white p-5"><h3 className="font-bold text-[#112b45]">TPA dan bacaan</h3><div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><p>Tajwid: <b>{achievement.tajwid_summary ?? "-"}</b></p><p>Makhraj: <b>{achievement.makhraj_summary ?? "-"}</b></p><p>Kelancaran: <b>{achievement.fluency_summary ?? "-"}</b></p></div></article>{achievement.public_notes.length > 0 && <article className="rounded-xl border border-[#d8e3ec] bg-white p-5"><h3 className="font-bold text-[#112b45]">Catatan perkembangan</h3><div className="mt-4 space-y-3">{achievement.public_notes.map((note) => <p key={note.content} className="border-l-2 border-[#e52335] pl-3 text-sm leading-6 text-slate-600">{note.content}</p>)}</div></article>}</section>}
      </div>
    </main>
  );
}
