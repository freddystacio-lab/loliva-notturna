import {createHash, randomBytes} from "node:crypto";
import {NextResponse} from "next/server";
import {reservationSchema} from "@/lib/reservations/schema";
import {createServiceClient} from "@/lib/supabase/server";
import {sendReservationConfirmation, sendReservationEventNotifications} from "@/lib/email/reservations";

export async function POST(request: Request) {
  const parsed = reservationSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({error: "invalid_input", fields: parsed.error.flatten().fieldErrors}, {status: 400});
  if (parsed.data.people >= 9) return NextResponse.json({error: "large_party", channel: "whatsapp"}, {status: 422});

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({error: "service_not_configured"}, {status: 503});

  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const {data, error} = await supabase.rpc("create_reservation_atomic", {
    p_guest_name: parsed.data.name,
    p_guest_email: parsed.data.email,
    p_guest_phone: parsed.data.phone,
    p_party_size: parsed.data.people,
    p_local_date: parsed.data.date,
    p_local_time: parsed.data.time,
    p_locale: parsed.data.locale,
    p_notes: parsed.data.notes ?? "",
    p_manage_token_hash: tokenHash,
  });

  if (error?.message.includes("no_availability")) return NextResponse.json({error: "no_availability"}, {status: 409});
  if (error?.message.includes("outside_service_hours")) return NextResponse.json({error: "outside_service_hours"}, {status: 422});
  if (error || !data?.[0]) return NextResponse.json({error: "reservation_failed"}, {status: 500});

  const email = await sendReservationConfirmation({email: parsed.data.email, name: parsed.data.name, code: data[0].public_code, date: parsed.data.date, time: parsed.data.time, people: parsed.data.people, locale: parsed.data.locale});
  await sendReservationEventNotifications({action:"created",code:data[0].public_code,guestEmail:parsed.data.email,guestName:parsed.data.name,locale:parsed.data.locale});
  return NextResponse.json({status: "confirmed", code: data[0].public_code, emailSent: email.sent}, {status: 201});
}
