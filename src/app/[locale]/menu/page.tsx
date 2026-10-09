import {Download} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {DietaryIcon} from "@/components/dietary-icon";
import {formatClp, menuSections, type DietaryTag} from "@/data/menu";
import type {Locale} from "@/i18n/routing";

export default async function MenuPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params; setRequestLocale(locale); const t = await getTranslations("menu");
  const labels: Record<DietaryTag, string> = {vegetarian: t("vegetarian"), vegan: t("vegan"), glutenFree: t("glutenFree"), spicy: t("spicy")};
  return <main><section className="bg-[var(--olive)] px-5 py-24 text-center text-[var(--ivory)]"><p className="eyebrow text-[var(--gold)]">{t("eyebrow")}</p><h1 className="serif mx-auto mt-5 max-w-4xl text-5xl sm:text-7xl">{t("title")}</h1><p className="mx-auto mt-7 max-w-2xl text-white/60">{t("body")}</p><a href={`/api/menu-pdf?locale=${locale}`} className="button-secondary mt-9"><Download size={16}/>{t("download")}</a></section>
    <section className="shell py-16 lg:py-24"><div className="mb-16 flex flex-wrap items-center gap-3 border-b border-[var(--line)] pb-8"><strong className="eyebrow mr-2">{t("legend")}</strong>{(Object.keys(labels) as DietaryTag[]).map((tag) => <span key={tag} className="flex items-center gap-2 text-sm"><DietaryIcon tag={tag} label={labels[tag]}/>{labels[tag]}</span>)}</div>
      <div className="grid gap-16 lg:grid-cols-2">{menuSections.map((section) => <article key={section.title.es}><h2 className="serif border-b border-[var(--line)] pb-4 text-4xl">{section.title[locale]}</h2><div>{section.items.map((item) => <div key={item.name.es} className="border-b border-[var(--line)] py-6"><div className="flex items-baseline justify-between gap-5"><h3 className="serif text-xl">{item.name[locale]}</h3><span className="shrink-0 text-sm font-bold">{formatClp(item.price)}</span></div><p className="mt-2 max-w-xl text-sm leading-6 text-black/55">{item.description[locale]}</p>{item.tags && <div className="mt-3 flex gap-2">{item.tags.map((tag) => <DietaryIcon key={tag} tag={tag} label={labels[tag]}/>)}</div>}</div>)}</div></article>)}</div>
    </section></main>;
}
