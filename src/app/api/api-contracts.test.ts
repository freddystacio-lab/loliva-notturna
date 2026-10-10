import {afterEach,describe,expect,it} from "vitest";
import {POST as createReservation} from "./reservations/route";
import {GET as createQr} from "./qr/route";
import {GET as createMenuPdf} from "./menu-pdf/route";
import {GET as runMaintenance} from "./cron/maintenance/route";

describe("public API contracts",()=>{
  const originalUrl=process.env.NEXT_PUBLIC_SUPABASE_URL; const originalService=process.env.SUPABASE_SERVICE_ROLE_KEY;
  afterEach(()=>{process.env.NEXT_PUBLIC_SUPABASE_URL=originalUrl;process.env.SUPABASE_SERVICE_ROLE_KEY=originalService;});
  it("rejects malformed reservation input",async()=>{const response=await createReservation(new Request("http://localhost/api/reservations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"x"})}));expect(response.status).toBe(400);});
  it("returns a controlled configuration error without database credentials",async()=>{delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;const response=await createReservation(new Request("http://localhost/api/reservations",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({name:"Cliente Demo",email:"demo@example.com",phone:"+56900000000",people:2,date:"2026-10-10",time:"20:00",locale:"es",privacyAccepted:true})}));expect(response.status).toBe(503);expect(await response.json()).toEqual({error:"service_not_configured"});});
  it("rejects unknown QR destinations",async()=>{const response=await createQr(new Request("http://localhost/api/qr?target=external&locale=es"));expect(response.status).toBe(400);});
  it("generates a valid menu PDF response",async()=>{delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;const response=await createMenuPdf(new Request("http://localhost/api/menu-pdf?locale=en"));expect(response.status).toBe(200);expect(response.headers.get("content-type")).toBe("application/pdf");const bytes=new Uint8Array(await response.arrayBuffer());expect(new TextDecoder().decode(bytes.slice(0,4))).toBe("%PDF");});
  it("rejects unauthorized maintenance requests",async()=>{process.env.CRON_SECRET="test-cron-secret";const response=await runMaintenance(new Request("http://localhost/api/cron/maintenance"));expect(response.status).toBe(401);delete process.env.CRON_SECRET;});
  it("returns a controlled maintenance configuration error",async()=>{process.env.CRON_SECRET="test-cron-secret";delete process.env.NEXT_PUBLIC_SUPABASE_URL;delete process.env.SUPABASE_SERVICE_ROLE_KEY;const response=await runMaintenance(new Request("http://localhost/api/cron/maintenance",{headers:{authorization:"Bearer test-cron-secret"}}));expect(response.status).toBe(503);delete process.env.CRON_SECRET;});
});
