import Image from "next/image";
import Link from "next/link";
import type { AppRole } from "@/lib/auth/authorization";

interface RoleMenuProps {
  roles: AppRole[];
  primaryRole: AppRole;
}

const roleLabels: Record<AppRole, string> = {
  ADMIN: "Admin Yayasan",
  GURU: "Guru",
  GURU_TPA: "Guru TPA",
  GURU_TAHFIDZH: "Guru TAHFIDZH",
  KETUA_YAYASAN: "Ketua Yayasan",
  KETUA_TPA: "Ketua TPA",
  KETUA_TAHFIDZH: "Ketua TAHFIDZH",
};

export function RoleMenu({ roles, primaryRole }: RoleMenuProps) {
  const effectiveRoles = [...new Set([primaryRole, ...roles])];
  const additionalRoles = effectiveRoles.filter((role) => role !== primaryRole);
  const isAdmin = effectiveRoles.includes("ADMIN");
  const isChair = effectiveRoles.includes("KETUA_YAYASAN");
  const isTpa = effectiveRoles.includes("GURU") || effectiveRoles.includes("GURU_TPA") || effectiveRoles.includes("KETUA_TPA");
  const isTahfizh = effectiveRoles.includes("GURU") || effectiveRoles.includes("GURU_TAHFIDZH") || effectiveRoles.includes("KETUA_TAHFIDZH");

  return (
    <aside className="w-full rounded-2xl border border-[#c8d7e3] bg-white p-5 shadow-sm lg:w-72">
      <div className="flex items-center gap-3 border-b border-[#d8e3ec] pb-5"><Image src={isTahfizh && !isTpa ? "/logo-tahfidzh.svg" : isTpa && !isTahfizh ? "/logo-tpa.svg" : "/logo.svg"} alt="Logo role" width={56} height={40} className="h-12 w-16 rounded-lg object-cover" /><div><p className="text-sm font-bold text-[#147fbd]">YAYASAN AL FITYAH</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">Role utama</p><p className="text-sm font-semibold leading-5 text-[#112b45]">{roleLabels[primaryRole]}</p>{additionalRoles.length > 0 && <><p className="mt-2 text-[10px] font-bold uppercase tracking-wide text-slate-400">Role tambahan</p><p className="text-xs leading-5 text-slate-600">{additionalRoles.map((role) => roleLabels[role]).join(" + ")}</p></>}</div></div>
      <nav className="mt-5 space-y-1 text-sm font-semibold"><Link className="block rounded-lg bg-[#eef7fc] px-3 py-2.5 text-[#147fbd]" href="/dashboard">Ringkasan</Link>{(isAdmin || isChair) && <><p className="px-3 pb-1 pt-4 text-xs uppercase tracking-wider text-slate-400">Data Santri</p><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/santri?program=TPA">Santri TPA</Link><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/santri?program=TAHFIDZH">Santri TAHFIDZH</Link></>}{isAdmin && <><p className="px-3 pb-1 pt-4 text-xs uppercase tracking-wider text-slate-400">Administrasi</p><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/guru">Data Guru</Link></>}{isChair && <><p className="px-3 pb-1 pt-4 text-xs uppercase tracking-wider text-slate-400">Pengawasan</p><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/aktivitas">Laporan Yayasan</Link></>}{isTpa && <><p className="px-3 pb-1 pt-4 text-xs uppercase tracking-wider text-[#147fbd]">Ruang TPA</p><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/santri?program=TPA">Data Santri TPA</Link><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/tpa">Pembelajaran TPA</Link><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/absensi">Absensi Santri</Link></>}{isTahfizh && <><p className="px-3 pb-1 pt-4 text-xs uppercase tracking-wider text-[#e52335]">Ruang TAHFIDZH</p><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#fff1f2]" href="/admin/santri?program=TAHFIDZH">Data Santri TAHFIDZH</Link><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#fff1f2]" href="/admin/hafalan">Setoran TAHFIDZH</Link><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#fff1f2]" href="/capaian-santri">Capaian TAHFIDZH</Link><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#fff1f2]" href="/admin/absensi">Absensi Santri</Link></>}{(isAdmin || isChair) && <><p className="px-3 pb-1 pt-4 text-xs uppercase tracking-wider text-slate-400">Kehadiran</p><Link className="block rounded-lg px-3 py-2.5 text-[#101820] hover:bg-[#eef7fc]" href="/admin/absensi-guru">Absensi Guru</Link></>}</nav>
    </aside>
  );
}
