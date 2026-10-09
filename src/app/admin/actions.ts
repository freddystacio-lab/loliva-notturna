"use server";

import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {createAuthServerClient} from "@/lib/supabase/auth-server";

export async function signIn(formData: FormData) {
  const supabase = await createAuthServerClient();
  if (!supabase) redirect("/admin?error=not_configured");
  const email = String(formData.get("email") ?? ""); const password = String(formData.get("password") ?? "");
  const {error} = await supabase.auth.signInWithPassword({email, password});
  if (error) redirect("/admin?error=invalid_credentials");
  redirect("/admin/manage");
}

export async function signOut() { const supabase = await createAuthServerClient(); if (supabase) await supabase.auth.signOut(); redirect("/admin"); }

export async function requestPasswordReset(formData:FormData){
  const supabase=await createAuthServerClient(); const email=String(formData.get("email")??"");
  if(supabase&&email)await supabase.auth.resetPasswordForEmail(email,{redirectTo:`${process.env.NEXT_PUBLIC_SITE_URL??"http://localhost:3000"}/auth/callback?next=/admin/reset`});
  redirect("/admin/recover?sent=1");
}

export async function updatePassword(formData:FormData){
  const supabase=await createAuthServerClient(); if(!supabase)redirect("/admin?error=not_configured");
  const password=String(formData.get("password")??"");
  if(password.length<12)redirect("/admin/reset?error=weak_password");
  const {error}=await supabase.auth.updateUser({password});
  if(error)redirect("/admin/reset?error=invalid_session");
  redirect("/admin/manage?status=password_updated");
}

export async function saveHeroDraft(formData: FormData) {
  const supabase = await createAuthServerClient(); if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims(); if (!claims?.claims) throw new Error("No autorizado");
  const locale = String(formData.get("locale")); if (!["es","en","it"].includes(locale)) throw new Error("Idioma inválido");
  const payload = {title: String(formData.get("title") ?? "").slice(0, 180), body: String(formData.get("body") ?? "").slice(0, 600)};
  const {error} = await supabase.from("content_entries").upsert({content_type:"hero",slug:"home",locale,status:"draft",payload,updated_at:new Date().toISOString()},{onConflict:"content_type,slug,locale,status"});
  if (error) throw new Error(error.message); revalidatePath("/admin/manage"); redirect(`/admin/manage?status=saved&locale=${locale}`);
}

export async function publishHero(formData: FormData) {
  const supabase = await createAuthServerClient(); if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims(); if (!claims?.claims) throw new Error("No autorizado");
  const locale = String(formData.get("locale")); const {data: draft, error} = await supabase.from("content_entries").select("payload").eq("content_type","hero").eq("slug","home").eq("locale",locale).eq("status","draft").single();
  if (error || !draft) throw new Error("No existe un borrador");
  const {error: publishError} = await supabase.from("content_entries").upsert({content_type:"hero",slug:"home",locale,status:"published",payload:draft.payload,published_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"content_type,slug,locale,status"});
  if (publishError) throw new Error(publishError.message); revalidatePath(`/${locale}`); revalidatePath("/admin/manage"); redirect(`/admin/manage?status=published&locale=${locale}`);
}
