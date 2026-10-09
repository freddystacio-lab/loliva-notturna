"use client";

import {useEffect} from "react";
import {useRouter} from "next/navigation";
import {FlagIcon} from "./flag-icon";

const languages = [
  {code: "es", label: "Español", note: "Bienvenidos"},
  {code: "en", label: "English", note: "Welcome"},
  {code: "it", label: "Italiano", note: "Benvenuti"},
] as const;

export function LanguageGateway() {
  const router = useRouter();

  useEffect(() => {
    const saved = window.localStorage.getItem("loliva-locale");
    if (saved && languages.some(({code}) => code === saved)) router.replace(`/${saved}`);
  }, [router]);

  function choose(code: string) {
    window.localStorage.setItem("loliva-locale", code);
    router.push(`/${code}`);
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--olive)] px-5 text-[var(--ivory)]">
      <div aria-hidden="true" className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_20%,#b5965a55,transparent_30%),radial-gradient(circle_at_80%_80%,#6d7c6655,transparent_35%)]" />
      <section className="relative w-full max-w-3xl border border-white/20 px-6 py-14 text-center sm:px-12 sm:py-20">
        <p className="eyebrow mb-8 text-[var(--gold)]">Viña del Mar · Chile</p>
        <p className="serif text-5xl leading-none sm:text-7xl">L’Oliva</p>
        <p className="mt-2 text-xs tracking-[.5em] uppercase">Notturna</p>
        <div className="mx-auto my-10 h-px w-20 bg-[var(--gold)]" />
        <h1 className="serif text-2xl italic sm:text-3xl">Scegli la tua lingua</h1>
        <div className="mt-10 grid gap-3 sm:grid-cols-3">
          {languages.map((language) => (
            <button key={language.code} onClick={() => choose(language.code)} className="focus-ring group border border-white/25 px-4 py-5 transition hover:border-[var(--gold)] hover:bg-white/5">
              <FlagIcon locale={language.code} className="mx-auto mb-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
              <span className="block text-xs tracking-[.18em] uppercase text-white/55">{language.note}</span>
              <span className="serif mt-2 block text-xl">{language.label}</span>
            </button>
          ))}
        </div>
        <p className="mt-10 text-xs leading-relaxed text-white/45">Fictional restaurant · Demonstration project</p>
      </section>
    </main>
  );
}
