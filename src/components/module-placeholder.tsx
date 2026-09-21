import Link from "next/link";

interface ModulePlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
  primaryHref: string;
  primaryLabel: string;
}

export function ModulePlaceholder({ eyebrow, title, description, primaryHref, primaryLabel }: ModulePlaceholderProps) {
  return (
    <main className="min-h-screen bg-[#f7fafc] px-5 py-10 lg:px-10"><div className="mx-auto max-w-4xl"><Link href="/" className="text-sm font-semibold text-[#147fbd]">&larr; Kembali ke ringkasan</Link><section className="mt-6 rounded-2xl border border-[#d8e3ec] bg-white p-8 shadow-sm"><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#e52335]">{eyebrow}</p><h1 className="mt-3 text-3xl font-bold text-[#112b45]">{title}</h1><p className="mt-3 max-w-2xl leading-7 text-slate-500">{description}</p><div className="mt-8 flex flex-wrap gap-3"><Link href={primaryHref} className="rounded-lg bg-[#e52335] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#c91d2e]">{primaryLabel}</Link><Link href="/dashboard" className="rounded-lg border border-[#1687c9] px-4 py-2.5 text-sm font-bold text-[#147fbd] hover:bg-[#edf8fe]">Buka dashboard</Link></div></section></div></main>
  );
}
