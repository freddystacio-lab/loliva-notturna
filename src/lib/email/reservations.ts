import {Resend} from "resend";

type Confirmation = {email: string; name: string; code: string; date: string; time: string; people: number; locale: "es" | "en" | "it"};
const subject = {es: "Tu reserva en L'Oliva Notturna", en: "Your reservation at L'Oliva Notturna", it: "La tua prenotazione a L'Oliva Notturna"};
const copy = {es: {hello:"Hola",confirmed:"Tu mesa está confirmada.",manage:"Modificar o cancelar reserva"},en:{hello:"Hello",confirmed:"Your table is confirmed.",manage:"Change or cancel booking"},it:{hello:"Ciao",confirmed:"Il tuo tavolo è confermato.",manage:"Modifica o cancella la prenotazione"}};
function escape(value: string) { return value.replace(/[&<>"]/g, (character) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[character]!); }

export async function sendReservationConfirmation(input: Confirmation) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return {sent: false, reason: "not_configured"} as const;
  const resend = new Resend(process.env.RESEND_API_KEY); const t = copy[input.locale];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const manageUrl = `${siteUrl}/${input.locale}/reservation/${input.code}`;
  const result = await resend.emails.send({from: process.env.RESEND_FROM_EMAIL, to: input.email, subject: subject[input.locale], html: `<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2a21"><p style="letter-spacing:.18em;text-transform:uppercase;color:#b5965a">L'Oliva Notturna</p><h1 style="font-family:Georgia,serif;font-weight:400">${t.hello}, ${escape(input.name)}.</h1><p>${t.confirmed}</p><div style="border-top:1px solid #ddd;border-bottom:1px solid #ddd;padding:20px 0;margin:24px 0"><strong>${escape(input.date)} · ${escape(input.time)}</strong><br>${input.people} personas · ${escape(input.code)}</div><a href="${manageUrl}" style="display:inline-block;background:#1d2a21;color:#fff;padding:14px 20px;text-decoration:none">${t.manage}</a><p style="margin-top:32px;font-size:12px;color:#777">Proyecto ficticio de demostración.</p></div>`});
  return {sent: !result.error, error: result.error} as const;
}

export async function sendReservationReminder(input: Omit<Confirmation,"date"|"time"|"token"> & {startsAt: string; manageUrl: string; window: "24h"|"1h"}) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return {sent:false,reason:"not_configured"} as const;
  const resend = new Resend(process.env.RESEND_API_KEY); const when = new Intl.DateTimeFormat(input.locale,{dateStyle:"full",timeStyle:"short",timeZone:"America/Santiago"}).format(new Date(input.startsAt));
  const subjects = {es:`Recordatorio: tu mesa es ${input.window === "24h" ? "mañana" : "en una hora"}`,en:`Reminder: your table is ${input.window === "24h" ? "tomorrow" : "in one hour"}`,it:`Promemoria: il tuo tavolo è ${input.window === "24h" ? "domani" : "tra un'ora"}`};
  const result = await resend.emails.send({from:process.env.RESEND_FROM_EMAIL,to:input.email,subject:subjects[input.locale],html:`<div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#1d2a21"><p style="letter-spacing:.18em;color:#b5965a">L'OLIVA NOTTURNA</p><h1 style="font-family:Georgia,serif;font-weight:400">${escape(input.name)}, te esperamos.</h1><p><strong>${escape(when)}</strong><br>${input.people} personas · ${escape(input.code)}</p><a href="${input.manageUrl}" style="display:inline-block;background:#1d2a21;color:white;padding:14px 20px;text-decoration:none">Gestionar reserva</a></div>`});
  return {sent:!result.error,error:result.error} as const;
}

export async function sendReservationEventNotifications(input: {action:"created"|"modified"|"cancelled";code:string;guestEmail:string;guestName:string;locale:"es"|"en"|"it"}) {
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) return {sent:false,reason:"not_configured"} as const;
  const resend = new Resend(process.env.RESEND_API_KEY);
  const actions = {created:{es:"creada",en:"created",it:"creata"},modified:{es:"modificada",en:"updated",it:"modificata"},cancelled:{es:"cancelada",en:"cancelled",it:"cancellata"}};
  const word = actions[input.action][input.locale];
  const deliveries: {to:string;subject:string;html:string}[] = input.action === "created" ? [] : [{to:input.guestEmail,subject:`Reserva ${word} · ${input.code}`,html:`<div style="font-family:Arial,sans-serif;color:#1d2a21"><p>L'OLIVA NOTTURNA</p><h1 style="font-family:Georgia,serif">${escape(input.guestName)}, tu reserva fue ${word}.</h1><p>Código: <strong>${escape(input.code)}</strong></p></div>`}];
  if (process.env.ADMIN_NOTIFICATION_EMAIL) deliveries.push({to:process.env.ADMIN_NOTIFICATION_EMAIL,subject:`Reserva ${input.action}: ${input.code}`,html:`<div style="font-family:Arial,sans-serif"><h1>Reserva ${input.action}</h1><p>Código: <strong>${escape(input.code)}</strong></p></div>`});
  const results = await Promise.all(deliveries.map((delivery)=>resend.emails.send({from:process.env.RESEND_FROM_EMAIL!,...delivery})));
  return {sent:results.every((result)=>!result.error)} as const;
}
