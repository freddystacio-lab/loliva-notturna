"use client";

import {useEffect,useState} from "react";
import {MessageCircle} from "lucide-react";
import {RefinedSelect} from "./refined-select";

type Reservation={public_code:string;status:string;starts_at:string;ends_at:string;party_size:number;locale:string};

export function ManageReservation({code}:{code:string}){
  const [reservation,setReservation]=useState<Reservation|null>(null);
  const [authorized,setAuthorized]=useState(false);
  const [loading,setLoading]=useState(true);
  const [pending,setPending]=useState(false);
  const [editing,setEditing]=useState(false);
  const [error,setError]=useState("");

  useEffect(()=>{
    fetch(`/api/reservations/${code}`).then(async(response)=>{
      if(response.status===401)return null;
      if(!response.ok)throw new Error();
      return response.json() as Promise<Reservation>;
    }).then((data)=>{if(data){setReservation(data);setAuthorized(true);}}).catch(()=>setError("No fue posible consultar la reserva.")).finally(()=>setLoading(false));
  },[code]);

  async function requestAccess(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setPending(true);setError("");
    const email=String(new FormData(event.currentTarget).get("email")??"");
    const access=await fetch(`/api/reservations/${code}/access`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email})});
    if(!access.ok){setError("No pudimos verificar esos datos.");setPending(false);return;}
    const response=await fetch(`/api/reservations/${code}`);
    if(response.ok){setReservation(await response.json());setAuthorized(true);}else setError("No fue posible consultar la reserva.");
    setPending(false);
  }

  async function cancel(){
    if(!window.confirm("¿Quieres cancelar esta reserva?"))return;
    setPending(true);setError("");
    const response=await fetch(`/api/reservations/${code}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action:"cancel"})});
    const result=await response.json();
    if(response.ok)setReservation((current)=>current?{...current,status:"cancelled"}:current);
    else if(result.error==="cancellation_cutoff")setError("El plazo de cancelación online terminó. Contáctanos por WhatsApp.");
    else setError("No fue posible cancelar la reserva.");
    setPending(false);
  }

  async function modify(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();setPending(true);setError("");
    const values=Object.fromEntries(new FormData(event.currentTarget));
    if(!values.time){setError("Selecciona una hora para continuar.");setPending(false);return;}
    const response=await fetch(`/api/reservations/${code}`,{method:"PATCH",headers:{"content-type":"application/json"},body:JSON.stringify({action:"modify",...values,people:Number(values.people)})});
    const result=await response.json();
    if(response.ok){setReservation((current)=>current?{...current,starts_at:result.reservation.starts_at,ends_at:result.reservation.ends_at,party_size:result.reservation.party_size}:current);setEditing(false);}
    else if(result.error==="modification_cutoff")setError("El plazo de modificación online terminó. Contáctanos por WhatsApp.");
    else if(result.error==="no_availability")setError("No hay disponibilidad para esa nueva fecha u hora.");
    else setError("No fue posible modificar la reserva.");
    setPending(false);
  }

  if(loading)return <p aria-live="polite">Cargando reserva…</p>;
  if(!authorized)return <form onSubmit={requestAccess} className="border border-[var(--line)] bg-white p-7 sm:p-10"><p className="eyebrow text-[var(--gold)]">Verificación</p><h2 className="serif mt-4 text-3xl">Confirma tu correo.</h2><p className="mt-3 text-sm leading-6 text-black/55">Ingresa el correo utilizado al reservar. La respuesta es deliberadamente genérica para proteger tus datos.</p><label className="mt-7 block"><span className="mb-2 block text-xs font-bold tracking-wider uppercase">Correo</span><input name="email" type="email" required autoComplete="email" className="w-full border border-black/20 p-3"/></label><button disabled={pending} className="button-primary mt-5">{pending?"Verificando…":"Continuar"}</button>{error&&<p role="alert" className="mt-4 border border-red-900/20 bg-red-50 p-3 text-sm text-red-900">{error}</p>}</form>;
  if(!reservation)return null;

  const times=Array.from({length:9},(_,index)=>`${String(18+Math.floor(index/2)).padStart(2,"0")}:${index%2?"30":"00"}`);
  return <div className="border border-[var(--line)] bg-white p-7 sm:p-10"><p className="eyebrow text-[var(--gold)]">Reserva {reservation.public_code}</p><p className="serif mt-5 text-3xl">{new Intl.DateTimeFormat(reservation.locale,{dateStyle:"full",timeStyle:"short",timeZone:"America/Santiago"}).format(new Date(reservation.starts_at))}</p><p className="mt-3 text-black/55">{reservation.party_size} personas · Estado: {reservation.status}</p>{error&&<p role="alert" className="mt-5 border border-red-900/20 bg-red-50 p-3 text-sm text-red-900">{error}</p>}{reservation.status==="confirmed"&&<>{editing?<form onSubmit={modify} className="mt-8 grid gap-4 sm:grid-cols-3"><label className="text-xs uppercase">Fecha<input name="date" type="date" required className="mt-2 min-h-11 w-full border border-black/20 bg-white px-3 text-base normal-case outline-none focus:border-[var(--gold)]"/></label><label className="text-xs uppercase">Hora<RefinedSelect className="mt-2 text-base normal-case" name="time" ariaLabel="Hora" options={[{value:"",label:"Seleccionar"},...times.map((time)=>({value:time,label:time}))]}/></label><label className="text-xs uppercase">Personas<RefinedSelect className="mt-2 text-base normal-case" name="people" defaultValue={String(reservation.party_size)} ariaLabel="Personas" options={Array.from({length:8},(_,index)=>({value:String(index+1),label:String(index+1)}))}/></label><div className="flex gap-3 sm:col-span-3"><button disabled={pending} className="button-primary">{pending?"Comprobando…":"Guardar cambio"}</button><button type="button" onClick={()=>setEditing(false)} className="button-secondary">Volver</button></div></form>:<div className="mt-8 flex flex-wrap gap-3"><button onClick={()=>setEditing(true)} className="button-primary">Modificar reserva</button><button disabled={pending} onClick={cancel} className="button-secondary">{pending?"Cancelando…":"Cancelar reserva"}</button><a href={`https://wa.me/?text=${encodeURIComponent(`Hola, necesito ayuda con la reserva ${code}.`)}`} className="button-secondary"><MessageCircle size={16}/>WhatsApp</a></div>}</>}</div>;
}
