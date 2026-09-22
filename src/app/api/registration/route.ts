import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const registrationSchema = z.object({
  student_name: z.string().trim().min(2).max(120),
  guardian_name: z.string().trim().max(120).optional(),
  guardian_phone: z.string().trim().max(24).optional(),
  program_name: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = registrationSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Nama santri wajib diisi dengan benar" }, { status: 400 });

  const supabase = await createClient();
  let programId: string | null = null;
  if (parsed.data.program_name) {
    const { data: program } = await supabase.from("programs").select("id").eq("name", parsed.data.program_name).eq("is_active", true).maybeSingle();
    programId = program?.id ?? null;
  }
  const { error } = await supabase.from("registration_requests").insert({
    student_name: parsed.data.student_name,
    guardian_name: parsed.data.guardian_name || null,
    guardian_phone: parsed.data.guardian_phone || null,
    program_id: programId,
    notes: parsed.data.notes || null,
  });

  if (error) return NextResponse.json({ error: "Pendaftaran belum dapat dikirim" }, { status: 500 });
  return NextResponse.json({ message: "Pendaftaran berhasil dikirim dan menunggu verifikasi yayasan" }, { status: 201 });
}
