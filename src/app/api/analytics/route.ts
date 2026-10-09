import {NextResponse} from "next/server";
import {z} from "zod";
import {createServiceClient} from "@/lib/supabase/server";

const analyticsSchema = z.object({event: z.enum(["page_view","menu_view","menu_pdf_download","qr_scan","availability_search","reservation_rejected","whatsapp_handoff"]), locale: z.enum(["es","en","it"]).optional(), properties: z.record(z.string(), z.union([z.string().max(100),z.number(),z.boolean()])).optional()});

export async function POST(request: Request) {
  const parsed = analyticsSchema.safeParse(await request.json()); if (!parsed.success) return NextResponse.json({error:"invalid_event"},{status:400});
  const supabase = createServiceClient(); if (!supabase) return new NextResponse(null,{status:204});
  const {error} = await supabase.from("analytics_events").insert({event_name:parsed.data.event,locale:parsed.data.locale,properties:parsed.data.properties ?? {}});
  return error ? NextResponse.json({error:"analytics_failed"},{status:500}) : new NextResponse(null,{status:204});
}
