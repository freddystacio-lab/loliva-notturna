import {ArrowRight} from "lucide-react";
import {getTranslations, setRequestLocale} from "next-intl/server";
import {EditorialImage} from "@/components/editorial-image";
import {Link} from "@/i18n/navigation";
import {getPublishedHero} from "@/lib/content/public";

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params; setRequestLocale(locale);
  const hero = await getTranslations("hero"); const home = await getTranslations("home");
  const publishedHero = await getPublishedHero(locale);
  return <main>
    <section className="grid min-h-[calc(100vh-5rem)] bg-[var(--olive)] text-[var(--ivory)] lg:grid-cols-[1.02fr_.98fr]">
      <div className="flex items-center px-5 py-20 sm:px-12 lg:px-[8vw]">
        <div className="max-w-2xl"><p className="eyebrow text-[var(--gold)]">{hero("eyebrow")}</p><h1 className="serif mt-6 text-5xl leading-[.98] sm:text-7xl xl:text-8xl">{publishedHero?.title ?? hero("title")}</h1><p className="mt-8 max-w-lg text-base leading-7 text-white/65 sm:text-lg">{publishedHero?.body ?? hero("body")}</p><div className="mt-10 flex flex-wrap gap-3"><Link href="/reserve" className="button-primary border-[var(--gold)] bg-[var(--gold)] text-[var(--ink)]">{hero("reserve")}</Link><Link href="/menu" className="button-secondary">{hero("menu")}</Link></div></div>
      </div>
      <EditorialImage label="Atmospheric dining room at L'Oliva Notturna" src="/images/hero-dining-room.png" className="min-h-[55vh] lg:min-h-full" />
    </section>
    <section className="shell grid gap-12 py-24 lg:grid-cols-[.75fr_1.25fr] lg:py-36"><p className="eyebrow text-[var(--gold)]">{home("introEyebrow")}</p><div><h2 className="serif max-w-3xl text-4xl leading-tight sm:text-6xl">{home("introTitle")}</h2><p className="mt-8 max-w-2xl text-lg leading-8 text-black/60">{home("introBody")}</p></div></section>
    <section className="grid bg-[var(--paper)] lg:grid-cols-2"><EditorialImage label="Handmade pumpkin ravioli with sage and hazelnuts" src="/images/ravioli-editorial.png" className="min-h-[520px]" /><div className="flex items-center px-8 py-20 sm:px-16 lg:px-[8vw]"><div><p className="eyebrow text-[var(--gold)]">{home("chefEyebrow")}</p><h2 className="serif mt-5 text-4xl sm:text-6xl">{home("chefTitle")}</h2><p className="mt-7 max-w-xl text-lg leading-8 text-black/60">{home("chefBody")}</p><Link href="/menu" className="mt-8 inline-flex items-center gap-2 text-xs font-bold tracking-[.15em] uppercase">Carta <ArrowRight size={16} /></Link></div></div></section>
    <section className="shell py-24 text-center lg:py-36"><p className="eyebrow text-[var(--gold)]">{home("experienceEyebrow")}</p><h2 className="serif mx-auto mt-5 max-w-4xl text-4xl sm:text-6xl">{home("experienceTitle")}</h2><p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-black/60">{home("experienceBody")}</p><Link href="/reserve" className="button-primary mt-10">{hero("reserve")}</Link></section>
  </main>;
}
