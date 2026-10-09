import {NextIntlClientProvider, hasLocale} from "next-intl";
import {getMessages, getTranslations, setRequestLocale} from "next-intl/server";
import {notFound} from "next/navigation";
import type {Metadata} from "next";
import {routing, type Locale} from "@/i18n/routing";
import {SiteHeader} from "@/components/site-header";
import {SiteFooter} from "@/components/site-footer";
import {AnalyticsBeacon} from "@/components/analytics-beacon";
import {Suspense} from "react";
import {MotionLayer} from "@/components/motion-layer";

export function generateStaticParams() { return routing.locales.map((locale) => ({locale})); }

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({locale, namespace: "meta"});
  return {title: t("title"), description: t("description")};
}

export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const messages = await getMessages();
  return <NextIntlClientProvider messages={messages}><Suspense fallback={null}><AnalyticsBeacon locale={locale as Locale}/></Suspense><SiteHeader locale={locale as Locale} /><MotionLayer>{children}</MotionLayer><SiteFooter /></NextIntlClientProvider>;
}
