import {PDFDocument, StandardFonts, rgb} from "pdf-lib";
import {NextResponse} from "next/server";
import {formatClp, menuSections} from "@/data/menu";
import {createServiceClient} from "@/lib/supabase/server";

const locales = new Set(["es", "en", "it"] as const);
type Locale = "es" | "en" | "it";
const labels = {
  es: {subtitle: "Cocina italiana contemporánea · Viña del Mar", note: "Carta de demostración · Precios en CLP", updated: "Actualizada"},
  en: {subtitle: "Contemporary Italian dining · Viña del Mar", note: "Demonstration menu · Prices in CLP", updated: "Updated"},
  it: {subtitle: "Cucina italiana contemporanea · Viña del Mar", note: "Menù dimostrativo · Prezzi in CLP", updated: "Aggiornato"},
};

function safe(text: string) { return text.replaceAll("’", "'").replaceAll("–", "-").replaceAll("·", "|"); }
function wrap(text: string, max = 78) { const words = safe(text).split(" "); const lines: string[] = []; let line = ""; for (const word of words) { const next = line ? `${line} ${word}` : word; if (next.length > max && line) { lines.push(line); line = word; } else line = next; } if (line) lines.push(line); return lines; }

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("locale") ?? "es";
  const locale: Locale = locales.has(requested as Locale) ? requested as Locale : "es";
  const pdf = await PDFDocument.create();
  const serif = await pdf.embedFont(StandardFonts.TimesRoman);
  const serifBold = await pdf.embedFont(StandardFonts.TimesRomanBold);
  const sans = await pdf.embedFont(StandardFonts.Helvetica);
  const olive = rgb(0.114, 0.165, 0.129); const gold = rgb(0.71, 0.59, 0.35); const ink = rgb(0.08, 0.09, 0.07); const paper = rgb(0.957, 0.937, 0.898);
  let page = pdf.addPage([595.28, 841.89]); let y = 760;
  const beginPage = () => { page.drawRectangle({x: 0, y: 0, width: 595.28, height: 841.89, color: paper}); page.drawRectangle({x: 0, y: 814, width: 595.28, height: 28, color: olive}); };
  const nextPage = () => { page = pdf.addPage([595.28, 841.89]); beginPage(); y = 770; };
  beginPage();
  page.drawText("L'OLIVA", {x: 55, y, size: 36, font: serif, color: olive}); y -= 20;
  page.drawText("N O T T U R N A", {x: 57, y, size: 8, font: sans, color: gold}); y -= 35;
  page.drawText(safe(labels[locale].subtitle), {x: 55, y, size: 10, font: sans, color: ink}); y -= 46;

  for (const section of menuSections) {
    if (y < 170) nextPage();
    page.drawText(safe(section.title[locale]).toUpperCase(), {x: 55, y, size: 17, font: serifBold, color: olive});
    page.drawLine({start: {x: 55, y: y - 9}, end: {x: 540, y: y - 9}, thickness: .6, color: gold}); y -= 34;
    for (const item of section.items) {
      if (y < 100) nextPage();
      page.drawText(safe(item.name[locale]), {x: 55, y, size: 12, font: serifBold, color: ink});
      const price = formatClp(item.price); page.drawText(price, {x: 540 - sans.widthOfTextAtSize(price, 10), y: y + 1, size: 10, font: sans, color: ink}); y -= 17;
      for (const line of wrap(item.description[locale])) { page.drawText(line, {x: 55, y, size: 9, font: sans, color: rgb(.33,.34,.31)}); y -= 12; }
      y -= 14;
    }
    y -= 14;
  }
  page.drawText(`${safe(labels[locale].note)} | ${labels[locale].updated}: ${new Intl.DateTimeFormat(locale, {dateStyle: "medium"}).format(new Date())}`, {x: 55, y: 38, size: 8, font: sans, color: rgb(.4,.4,.37)});
  const bytes = await pdf.save();
  const supabase = createServiceClient();
  if (supabase) await supabase.from("analytics_events").insert({event_name:"menu_pdf_download",locale,properties:{}});
  return new NextResponse(Buffer.from(bytes), {headers: {"content-type": "application/pdf", "content-disposition": `attachment; filename="loliva-notturna-menu-${locale}.pdf"`, "cache-control": "no-store"}});
}
