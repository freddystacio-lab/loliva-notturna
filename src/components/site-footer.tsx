import {useTranslations} from "next-intl";
import {Link} from "@/i18n/navigation";
import NextLink from "next/link";

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-[var(--olive)] py-16 text-[var(--ivory)]">
      <div className="shell grid gap-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div><p className="serif text-4xl">L’Oliva</p><p className="text-xs tracking-[.45em] uppercase">Notturna</p></div>
        <div className="text-sm leading-7 text-white/70"><p>{t("hours")}</p><p>{t("location")}</p></div>
        <div className="flex flex-col items-start gap-3 text-sm text-white/70"><Link href="/privacy" className="hover:text-white">Privacidad</Link><Link href="/contact" className="hover:text-white">Contacto</Link><NextLink href="/admin" className="hover:text-white">Administración</NextLink><NextLink href="/admin/demo" className="hover:text-white">Ver demo del panel</NextLink></div>
      </div>
      <div className="shell mt-14 border-t border-white/15 pt-6 text-xs text-white/45">{t("demo")}</div>
    </footer>
  );
}
