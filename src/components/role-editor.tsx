import { updateTeacherRoles } from "@/app/admin/guru/actions";

interface RoleEditorProps {
  userId: string;
  primaryRole: string;
  additionalRoles: string[];
}

export function RoleEditor({ userId, primaryRole, additionalRoles }: RoleEditorProps) {
  return (
    <details className="mt-3">
      <summary className="cursor-pointer text-xs font-bold text-[#147fbd]">Edit role</summary>
      <form action={updateTeacherRoles} className="mt-3 space-y-2 rounded-lg bg-[#f7fafc] p-3">
        <input type="hidden" name="user_id" value={userId} />
        <select name="role" defaultValue={primaryRole} className="w-full rounded border border-[#c8d7e3] bg-white px-2 py-1.5 text-xs">
          <option value="GURU">Guru</option>
          <option value="KETUA_YAYASAN">Ketua Yayasan</option>
        </select>
        <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" name="role_guru" defaultChecked={additionalRoles.includes("GURU")} /> Guru</label>
        <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" name="role_ketua_tpa" defaultChecked={additionalRoles.includes("KETUA_TPA")} /> Ketua TPA</label>
        <label className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" name="role_ketua_tahfizh" defaultChecked={additionalRoles.includes("KETUA_TAHFIDZH")} /> Ketua TAHFIDZH</label>
        <button className="rounded bg-[#1687c9] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#116b9f]">Simpan role</button>
      </form>
    </details>
  );
}
