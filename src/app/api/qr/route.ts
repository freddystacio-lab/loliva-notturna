import QRCode from "qrcode";
import {NextResponse} from "next/server";

const paths = {home: "", menu: "/menu", reserve: "/reserve"} as const;
const locales = new Set(["es", "en", "it"]);

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("target") as keyof typeof paths | null;
  const locale = url.searchParams.get("locale") ?? "es";
  const campaign = url.searchParams.get("campaign")?.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 40);
  if (!target || !(target in paths) || !locales.has(locale)) return NextResponse.json({error: "invalid_qr_target"}, {status: 400});

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const destination = new URL(`/${locale}${paths[target]}`, siteUrl);
  destination.searchParams.set("source", "qr");
  if (campaign) destination.searchParams.set("campaign", campaign);
  const svg = await QRCode.toString(destination.toString(), {type: "svg", errorCorrectionLevel: "H", margin: 2, color: {dark: "#1D2A21", light: "#F4EFE5"}});
  return new NextResponse(svg, {headers: {"content-type": "image/svg+xml; charset=utf-8", "content-disposition": `attachment; filename="loliva-${target}-${locale}.svg"`, "cache-control": "public, max-age=3600"}});
}
