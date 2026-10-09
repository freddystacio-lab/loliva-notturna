import {NextResponse,type NextRequest} from "next/server";
import {createServiceClient} from "@/lib/supabase/server";
import {RESERVATION_ACCESS_COOKIE,verifyReservationSession} from "@/lib/reservations/tokens";
import {z} from "zod";
import {sendReservationEventNotifications} from "@/lib/email/reservations";

const changeSchema = z.discriminatedUnion("action", [
  z.object({action:z.literal("cancel")}),
  z.object({action:z.literal("modify"),date:z.iso.date(),time:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),people:z.coerce.number().int().min(1).max(8)}),
]);

export async function GET(request: NextRequest, context: {params: Promise<{code: string}>}) {
  const {code} = await context.params;
  if (!verifyReservationSession(code,request.cookies.get(RESERVATION_ACCESS_COOKIE)?.value)) return NextResponse.json({error: "unauthorized"}, {status: 401});
  const supabase = createServiceClient(); if (!supabase) return NextResponse.json({error: "service_not_configured"}, {status: 503});
  const {data, error} = await supabase.from("reservations").select("public_code,status,starts_at,ends_at,party_size,locale").eq("public_code", code.toUpperCase()).maybeSingle();
  if (error || !data) return NextResponse.json({error: "reservation_not_found"}, {status: 404});
  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, context: {params: Promise<{code: string}>}) {
  const {code} = await context.params; const parsed = changeSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({error: "invalid_action"}, {status: 400});
  if (!verifyReservationSession(code,request.cookies.get(RESERVATION_ACCESS_COOKIE)?.value)) return NextResponse.json({error:"unauthorized"},{status:401});
  const body = parsed.data;
  const supabase = createServiceClient(); if (!supabase) return NextResponse.json({error: "service_not_configured"}, {status: 503});
  const {data: record} = await supabase.from("reservations").select("manage_token_hash,guest_email,guest_name,locale").eq("public_code",code.toUpperCase()).maybeSingle();
  if (!record) return NextResponse.json({error:"reservation_not_found"},{status:404});
  const storedHash = record.manage_token_hash;
  if (body.action === "modify") {
    const {data, error} = await supabase.rpc("modify_reservation_with_token",{p_public_code:code,p_token_hash:storedHash,p_party_size:body.people,p_local_date:body.date,p_local_time:body.time});
    if (error?.message.includes("modification_cutoff")) return NextResponse.json({error:"modification_cutoff",channel:"whatsapp"},{status:409});
    if (error?.message.includes("no_availability")) return NextResponse.json({error:"no_availability"},{status:409});
    if (error || !data?.[0]) return NextResponse.json({error:"reservation_not_found"},{status:404});
    await sendReservationEventNotifications({action:"modified",code:code.toUpperCase(),guestEmail:record.guest_email,guestName:record.guest_name,locale:record.locale});
    return NextResponse.json({status:"modified",reservation:data[0]});
  }
  const {data, error} = await supabase.rpc("cancel_reservation_with_token", {p_public_code: code, p_token_hash: storedHash});
  if (error?.message.includes("cancellation_cutoff")) return NextResponse.json({error: "cancellation_cutoff", channel: "whatsapp"}, {status: 409});
  if (error || !data?.[0]) return NextResponse.json({error: "reservation_not_found"}, {status: 404});
  await sendReservationEventNotifications({action:"cancelled",code:code.toUpperCase(),guestEmail:record.guest_email,guestName:record.guest_name,locale:record.locale});
  return NextResponse.json({status: "cancelled"});
}
