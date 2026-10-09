import {createClient} from "@supabase/supabase-js";
import {getSupabasePublicConfig} from "@/lib/supabase/config";

export async function getPublishedHero(locale: string) {
  const config = getSupabasePublicConfig(); if (!config) return null;
  const supabase = createClient(config.url, config.key, {auth:{persistSession:false,autoRefreshToken:false}});
  const {data} = await supabase.from("content_entries").select("payload").eq("content_type","hero").eq("slug","home").eq("locale",locale).eq("status","published").maybeSingle();
  const payload = data?.payload as {title?: unknown; body?: unknown} | undefined;
  if (!payload || typeof payload.title !== "string" || typeof payload.body !== "string") return null;
  return {title: payload.title, body: payload.body};
}
