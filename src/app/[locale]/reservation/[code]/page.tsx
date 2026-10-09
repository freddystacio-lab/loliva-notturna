import {Suspense} from "react";
import {ManageReservation} from "@/components/manage-reservation";

export default async function ManageReservationPage({params}: {params: Promise<{code: string}>}) { const {code} = await params; return <main className="shell max-w-3xl py-20 lg:py-28"><p className="eyebrow text-[var(--gold)]">Tu reserva</p><h1 className="serif mt-4 text-5xl">Gestiona tu mesa.</h1><p className="mt-5 mb-10 leading-7 text-black/55">Puedes cancelar hasta una hora antes. Para cambios dentro de las dos horas previas, contáctanos por WhatsApp.</p><Suspense fallback={<p>Cargando…</p>}><ManageReservation code={code}/></Suspense></main>; }
