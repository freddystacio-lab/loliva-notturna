import {NextResponse} from "next/server";
import {createServiceClient} from "@/lib/supabase/server";
import {sendReservationReminder} from "@/lib/email/reservations";

export async function GET(request: Request) {
  const secret = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || secret !== `Bearer ${process.env.CRON_SECRET}`) return NextResponse.json({error:"unauthorized"},{status:401});
  const supabase = createServiceClient(); if (!supabase) return NextResponse.json({error:"service_not_configured"},{status:503});
  const now = Date.now(); const windows = [
    {kind:"24h" as const,from:new Date(now+23.5*3_600_000),to:new Date(now+24.5*3_600_000),column:"reminder_24h_sent_at" as const},
    {kind:"1h" as const,from:new Date(now+.75*3_600_000),to:new Date(now+1.25*3_600_000),column:"reminder_1h_sent_at" as const},
  ];
  let sent = 0;
  for (const window of windows) {
    const {data} = await supabase.from("reservations").select("id,public_code,guest_name,guest_email,party_size,starts_at,locale").eq("status","confirmed").is(window.column,null).gte("starts_at",window.from.toISOString()).lt("starts_at",window.to.toISOString());
    for (const reservation of data ?? []) {
      const manageUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/${reservation.locale}/reservation/${reservation.public_code}`;
      const result = await sendReservationReminder({email:reservation.guest_email,name:reservation.guest_name,code:reservation.public_code,people:reservation.party_size,locale:reservation.locale,startsAt:reservation.starts_at,manageUrl,window:window.kind});
      if (result.sent) { await supabase.from("reservations").update({[window.column]:new Date().toISOString()}).eq("id",reservation.id); sent++; }
    }
  }
  return NextResponse.json({sent});
}
