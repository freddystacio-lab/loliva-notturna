import createMiddleware from "next-intl/middleware";
import {routing} from "./i18n/routing";
import {NextResponse, type NextRequest} from "next/server";
import {updateAdminSession} from "./lib/supabase/auth-proxy";

const intlProxy = createMiddleware(routing);

export default async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/" || request.nextUrl.pathname === "/sitemap.xml" || request.nextUrl.pathname === "/robots.txt") return NextResponse.next();
  if (request.nextUrl.pathname.startsWith("/admin/manage")) return updateAdminSession(request);
  return intlProxy(request);
}

export const config = {
  matcher: ["/admin/manage/:path*", "/((?!api|admin|_next|_vercel|.*\\..*).*)"],
};
