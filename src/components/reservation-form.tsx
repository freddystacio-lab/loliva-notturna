"use client";

import {useState} from "react";
import {MessageCircle} from "lucide-react";
import {RefinedSelect} from "./refined-select";

export function ReservationForm({locale}: {locale: string}) {
  const [people, setPeople] = useState(2);
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const largeGroup = people >= 9;
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending"); setMessage("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    if (!values.time) { setStatus("error"); setMessage("Selecciona una hora para continuar."); return; }
    const response = await fetch("/api/reservations", {method: "POST", headers: {"content-type": "application/json"}, body: JSON.stringify({...values, people, privacyAccepted: values.privacyAccepted === "on"})});
    const result = await response.json();
    if (response.ok) { setStatus("success"); setMessage(`Reserva confirmada · ${result.code}`); event.currentTarget.reset(); }
    else { setStatus("error"); setMessage(result.error === "service_not_configured" ? "El servicio de reservas estará disponible al conectar Supabase." : "No fue posible confirmar la reserva. Intenta otra franja."); }
  }
  return <form className="grid gap-5" onSubmit={submit}>
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Nombre / Name"><input required name="name" autoComplete="name" className="w-full bg-transparent outline-none" /></Field><Field label="Correo / Email"><input required type="email" name="email" autoComplete="email" className="w-full bg-transparent outline-none" /></Field></div>
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Teléfono / WhatsApp"><input required type="tel" name="phone" autoComplete="tel" className="w-full bg-transparent outline-none" /></Field><Field label="Personas"><RefinedSelect name="people" value={String(people)} onChange={(next) => setPeople(Number(next))} ariaLabel="Personas" options={Array.from({length: 12}, (_, i) => ({value: String(i + 1), label: String(i + 1)}))}/></Field></div>
    <div className="grid gap-5 sm:grid-cols-2"><Field label="Fecha"><input required type="date" name="date" className="w-full bg-transparent outline-none" /></Field><Field label="Hora"><RefinedSelect name="time" ariaLabel="Hora" options={[{value:"",label:"Seleccionar"}, ...Array.from({length: 9}, (_, i) => `${String(18 + Math.floor(i / 2)).padStart(2,"0")}:${i % 2 ? "30" : "00"}`).map((time) => ({value:time,label:time}))]}/></Field></div>
    <Field label="Alergias, restricciones u ocasión especial (opcional)"><textarea name="notes" rows={4} className="w-full resize-y bg-transparent outline-none" /></Field>
    <label className="flex items-start gap-3 text-sm leading-6 text-black/60"><input required type="checkbox" name="privacyAccepted" className="mt-1"/><span>Acepto el tratamiento de mis datos para gestionar esta reserva y he leído la política de privacidad.</span></label>
    {largeGroup ? <a className="button-primary" href={`https://wa.me/?text=${encodeURIComponent(`Hola, quisiera consultar disponibilidad para un grupo de ${people} personas en L'Oliva Notturna.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/>Continuar por WhatsApp</a> : <button disabled={status === "sending"} type="submit" className="button-primary disabled:opacity-50">{status === "sending" ? "Comprobando…" : "Buscar disponibilidad"}</button>}
    {message && <p role="status" className={`border p-4 text-sm ${status === "success" ? "border-green-700 bg-green-50 text-green-900" : "border-red-700 bg-red-50 text-red-900"}`}>{message}</p>}
    <input type="hidden" name="locale" value={locale}/>
  </form>;
}

function Field({label, children}: {label: string; children: React.ReactNode}) { return <label className="block border-b border-[var(--line)] pb-3"><span className="mb-2 block text-[.68rem] font-bold tracking-[.12em] uppercase text-black/50">{label}</span>{children}</label>; }
