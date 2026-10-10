import {NextResponse} from "next/server";
import {createServiceClient} from "@/lib/supabase/server";

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!process.env.CRON_SECRET || authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({error: "unauthorized"}, {status: 401});
  }

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({error: "service_not_configured"}, {status: 503});

  const {error} = await supabase.rpc("purge_expired_personal_data");
  if (error) return NextResponse.json({error: "maintenance_failed"}, {status: 500});

  return NextResponse.json({status: "completed"});
}
