import {NextResponse} from "next/server";
import {z} from "zod";
import {createServiceClient} from "@/lib/supabase/server";
import {createReservationSession,RESERVATION_ACCESS_COOKIE} from "@/lib/reservations/tokens";

const accessSchema=z.object({email:z.email().max(254)});

export async function POST(request:Request,context:{params:Promise<{code:string}>}){
  const {code}=await context.params; const parsed=accessSchema.safeParse(await request.json());
  if(!parsed.success)return NextResponse.json({error:"invalid_access"},{status:401});
  const supabase=createServiceClient(); if(!supabase)return NextResponse.json({error:"service_not_configured"},{status:503});
  const forwarded=request.headers.get("x-forwarded-for");
  const ip=forwarded?.split(",")[0]?.trim()||request.headers.get("x-real-ip")||"unknown";
  const {data:allowed,error:rateLimitError}=await supabase.rpc("consume_rate_limit",{p_key:`reservation_access:${ip}`,p_limit:10,p_window_seconds:300});
  if(!rateLimitError && allowed===false)return NextResponse.json({error:"too_many_attempts"},{status:429});
  const {data}=await supabase.from("reservations").select("id").eq("public_code",code.toUpperCase()).ilike("guest_email",parsed.data.email.trim()).maybeSingle();
  const session=data&&createReservationSession(code);
  if(!session)return NextResponse.json({error:"invalid_access"},{status:401});
  const response=NextResponse.json({status:"authorized"});
  response.cookies.set(RESERVATION_ACCESS_COOKIE,session,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",maxAge:24*60*60,path:"/"});
  return response;
}
