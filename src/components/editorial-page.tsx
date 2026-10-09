import {EditorialImage} from "./editorial-image";

export function EditorialPage({eyebrow, title, intro, sections, imageSrc}: {eyebrow: string; title: string; intro: string; sections: {title: string; body: string}[]; imageSrc?: string}) {
  return <main><section className="shell grid gap-12 py-20 lg:grid-cols-[1fr_1.1fr] lg:py-28"><div><p className="eyebrow text-[var(--gold)]">{eyebrow}</p><h1 className="serif mt-5 text-5xl leading-tight sm:text-7xl">{title}</h1></div><p className="self-end text-lg leading-8 text-black/60">{intro}</p></section><EditorialImage label={title} src={imageSrc} className="min-h-[55vh]"/><section className="shell grid gap-12 py-20 md:grid-cols-2 lg:py-28">{sections.map((section) => <article key={section.title} className="border-t border-[var(--line)] pt-7"><h2 className="serif text-3xl">{section.title}</h2><p className="mt-5 leading-7 text-black/60">{section.body}</p></article>)}</section></main>;
}
