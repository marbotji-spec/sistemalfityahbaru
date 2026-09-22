"use client";

import { useState } from "react";

export function PublicRegistrationForm() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/registration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    const result = await response.json();
    setMessage(result.message ?? result.error);
    setLoading(false);
    if (response.ok) event.currentTarget.reset();
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block text-sm font-semibold text-[#101820]">Nama santri *<input name="student_name" required className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#e52335]" /></label>
      <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold text-[#101820]">Nama wali<input name="guardian_name" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#e52335]" /></label><label className="block text-sm font-semibold text-[#101820]">Nomor WhatsApp<input name="guardian_phone" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#e52335]" /></label></div>
      <label className="block text-sm font-semibold text-[#101820]">Program yang diminati<select name="program_name" defaultValue="" className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] bg-white px-3 py-2.5 text-sm font-normal"><option value="">Belum menentukan</option><option value="TPA">TPA</option><option value="TAHFIDZH">TAHFIDZH</option></select></label>
      <label className="block text-sm font-semibold text-[#101820]">Catatan tambahan<textarea name="notes" rows={3} className="mt-1.5 w-full rounded-lg border border-[#c8d7e3] px-3 py-2.5 text-sm font-normal outline-none focus:border-[#e52335]" /></label>
      {message && <p className="rounded-lg bg-[#eef7fc] p-3 text-sm font-medium text-[#101820]">{message}</p>}
      <button disabled={loading} className="w-full rounded-lg bg-[#e52335] px-4 py-3 text-sm font-bold text-white hover:bg-[#c91d2e] disabled:opacity-60">{loading ? "Mengirim..." : "Kirim pendaftaran"}</button>
    </form>
  );
}
