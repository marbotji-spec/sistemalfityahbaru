import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")?.trim();

  if (!code || code.length < 6 || code.length > 40) {
    return NextResponse.json({ error: "Kode santri tidak valid" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_public_achievement", { lookup_code: code });

  if (error) {
    return NextResponse.json({ error: "Capaian belum dapat diakses" }, { status: 500 });
  }

  if (!data?.[0]) {
    return NextResponse.json({ error: "Capaian tidak ditemukan" }, { status: 404 });
  }

  return NextResponse.json({ data: data[0] }, { headers: { "Cache-Control": "no-store" } });
}
