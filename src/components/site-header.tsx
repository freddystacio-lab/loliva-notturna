"use client";

import {Menu, X} from "lucide-react";
import {useTranslations} from "next-intl";
import {useState} from "react";
import {Link, usePathname, useRouter} from "@/i18n/navigation";
import type {Locale} from "@/i18n/routing";
import {FlagIcon} from "./flag-icon";
import {RefinedSelect} from "./refined-select";

export function SiteHeader({locale}: {locale: Locale}) {
  const t = useTranslations("nav");
  const l = useTranslations("language");
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const links = [
    ["/", t("home")], ["/menu", t("menu")], ["/story", t("story")],
    ["/experiences", t("experiences")], ["/gallery", t("gallery")], ["/contact", t("contact")],
  ] as const;
  const languageOptions = (["es", "en", "it"] as const).map((code) => ({value: code, label: code.toUpperCase(), icon: <FlagIcon locale={code}/>}));

  function changeLocale(nextLocale: string) {
    window.localStorage.setItem("loliva-locale", nextLocale);
    router.replace(pathname, {locale: nextLocale as Locale});
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-[color:rgba(244,239,229,.92)] backdrop-blur-xl">
      <div className="shell flex h-20 items-center justify-between gap-6">
        <Link href="/" className="focus-ring shrink-0" aria-label="L'Oliva Notturna">
          <span className="serif block text-2xl leading-none">L’Oliva</span>
          <span className="block text-[.55rem] tracking-[.38em] uppercase">Notturna</span>
        </Link>
        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {links.map(([href, label]) => <Link key={href} href={href} className="focus-ring text-xs font-bold tracking-[.1em] uppercase hover:text-[var(--gold)]">{label}</Link>)}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <RefinedSelect compact value={locale} options={languageOptions} onChange={changeLocale} ariaLabel={l("change")}/>
          <Link href="/reserve" className="button-primary focus-ring">{t("reserve")}</Link>
        </div>
        <button className="focus-ring p-2 lg:hidden" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X /> : <Menu />}</button>
      </div>
      <div className={`mobile-menu lg:hidden ${open ? "is-open" : ""}`} aria-hidden={!open}>
        <nav className="border-t border-black/10 bg-[var(--ivory)] px-5 py-6" aria-label="Mobile">
          <div className="grid gap-1">
            {links.map(([href, label]) => <Link key={href} href={href} onClick={() => setOpen(false)} className="serif border-b border-black/10 py-3 text-2xl">{label}</Link>)}
            <div className="mt-4 flex items-center justify-between border-b border-black/10 pb-4 sm:hidden"><span className="text-xs font-bold tracking-wider uppercase text-black/50">{l("change")}</span><RefinedSelect compact value={locale} options={languageOptions} onChange={changeLocale} ariaLabel={l("change")}/></div>
            <Link href="/reserve" onClick={() => setOpen(false)} className="button-primary mt-4">{t("reserve")}</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
