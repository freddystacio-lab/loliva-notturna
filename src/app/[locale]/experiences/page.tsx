import {EditorialPage} from "@/components/editorial-page";
import {pageCopy} from "@/data/page-copy";
import type {Locale} from "@/i18n/routing";
export default async function ExperiencesPage({params}:{params:Promise<{locale:Locale}>}) { const {locale}=await params; return <EditorialPage {...pageCopy.experiences[locale]}/>; }
