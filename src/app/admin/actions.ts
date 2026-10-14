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

export async function updateReservationStatus(formData: FormData) {
  const supabase = await createAuthServerClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims();
  if (!claims?.claims) throw new Error("No autorizado");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const status = String(formData.get("status") ?? "").trim();
  if (!/^[A-F0-9]{8}$/.test(code)) throw new Error("Código de reserva inválido");
  if (!["confirmed", "completed", "no_show", "cancelled"].includes(status)) throw new Error("Estado inválido");
  const {error} = await supabase.from("reservations").update({status, updated_at: new Date().toISOString()}).eq("public_code", code);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/manage");
  redirect(`/admin/manage?status=updated`);
}

export async function saveServiceException(formData: FormData) {
  const supabase = await createAuthServerClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims();
  if (!claims?.claims) throw new Error("No autorizado");
  const date = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Fecha inválida");
  const isClosed = formData.get("isClosed") === "on";
  const opensAt = String(formData.get("opensAt") ?? "").trim();
  const closesAt = String(formData.get("closesAt") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim().slice(0, 120);
  if (!isClosed && (!/^\d{2}:\d{2}$/.test(opensAt) || !/^\d{2}:\d{2}$/.test(closesAt))) {
    throw new Error("Indica apertura y cierre o marca la fecha como cerrada");
  }
  const {error} = await supabase.from("service_exceptions").upsert({
    exception_date: date,
    is_closed: isClosed,
    opens_at: isClosed ? null : opensAt,
    closes_at: isClosed ? null : closesAt,
    reason,
    updated_at: new Date().toISOString(),
  }, {onConflict: "exception_date"});
  if (error) throw new Error(error.message);
  revalidatePath("/admin/manage");
  redirect("/admin/manage?status=exceptions_updated");
}

export async function updateWaitlistStatus(formData: FormData) {
  const supabase = await createAuthServerClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims();
  if (!claims?.claims) throw new Error("No autorizado");
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new Error("ID inválido");
  if (!["pending", "contacted", "closed"].includes(status)) throw new Error("Estado inválido");
  const {error} = await supabase.from("reservation_waitlist").update({status, updated_at: new Date().toISOString()}).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/manage");
  redirect("/admin/manage?status=waitlist_updated");
}

export async function deleteServiceException(formData: FormData) {
  const supabase = await createAuthServerClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims();
  if (!claims?.claims) throw new Error("No autorizado");
  const date = String(formData.get("date") ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Fecha inválida");
  const {error} = await supabase.from("service_exceptions").delete().eq("exception_date", date);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/manage");
  redirect("/admin/manage?status=exceptions_updated");
}

export async function publishHero(formData: FormData) {
  const supabase = await createAuthServerClient(); if (!supabase) throw new Error("Supabase no configurado");
  const {data: claims} = await supabase.auth.getClaims(); if (!claims?.claims) throw new Error("No autorizado");
  const locale = String(formData.get("locale")); const {data: draft, error} = await supabase.from("content_entries").select("payload").eq("content_type","hero").eq("slug","home").eq("locale",locale).eq("status","draft").single();
  if (error || !draft) throw new Error("No existe un borrador");
  const {error: publishError} = await supabase.from("content_entries").upsert({content_type:"hero",slug:"home",locale,status:"published",payload:draft.payload,published_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:"content_type,slug,locale,status"});
  if (publishError) throw new Error(publishError.message); revalidatePath(`/${locale}`); revalidatePath("/admin/manage"); redirect(`/admin/manage?status=published&locale=${locale}`);
}
