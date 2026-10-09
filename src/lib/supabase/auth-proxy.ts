import {createServerClient} from "@supabase/ssr";
import {NextResponse, type NextRequest} from "next/server";
import {getSupabasePublicConfig} from "./config";

export async function updateAdminSession(request: NextRequest) {
  const config = getSupabasePublicConfig();
  if (!config) return NextResponse.redirect(new URL("/admin?error=not_configured", request.url));
  let response = NextResponse.next({request});
  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll() { return request.cookies.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        response = NextResponse.next({request});
        cookiesToSet.forEach(({name, value, options}) => response.cookies.set(name, value, options));
      },
    },
  });
  const {data} = await supabase.auth.getClaims();
  if (!data?.claims) {
    const login = new URL("/admin", request.url); login.searchParams.set("error", "auth_required");
    const redirect = NextResponse.redirect(login);
    response.cookies.getAll().forEach(({name, value}) => redirect.cookies.set(name, value));
    return redirect;
  }
  return response;
}
