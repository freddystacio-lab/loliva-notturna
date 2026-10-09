import {EditorialPage} from "@/components/editorial-page";
import {pageCopy} from "@/data/page-copy";
import type {Locale} from "@/i18n/routing";
export default async function StoryPage({params}: {params: Promise<{locale: Locale}>}) { const {locale} = await params; const copy = pageCopy.story[locale]; return <EditorialPage {...copy} imageSrc="/images/hero-dining-room.png"/>; }
