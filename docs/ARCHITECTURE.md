# Arquitectura

## Límites principales

- `src/app/[locale]`: experiencia pública localizada.
- `src/app/api`: capa HTTP para reservas, PDF y QR.
- `src/app/admin`: acceso y panel de administración.
- `src/data`: contenido inicial de demostración.
- `src/lib`: reglas de dominio e integraciones del servidor.
- `supabase/migrations`: fuente de verdad del modelo persistente.

## Reserva

1. El cliente envía datos mínimos al Route Handler.
2. Zod valida formato, límites y consentimiento.
3. La función PostgreSQL toma un bloqueo transaccional por franja.
4. Se elige la unidad disponible de menor capacidad suficiente.
5. Reserva y asignación de mesas se guardan en la misma transacción.
6. Se registra únicamente analítica operativa agregada.
7. Resend envía la confirmación si está configurado.

Las modificaciones repiten la asignación dentro de una transacción, excluyen la reserva actual y reinician los recordatorios. Las cancelaciones liberan las mesas al cambiar el estado de la reserva.

La asignación no se decide solo en el navegador ni mediante una secuencia de consultas separadas, evitando dobles reservas por concurrencia.

## Privacidad

- Contacto: anonimización 30 días después de la atención.
- Alergias, restricciones y ocasión: eliminación 48 horas después.
- Métricas: solo propiedades operativas no identificables.
- Gestión del cliente: verificación del correo asociado y cookie de sesión firmada, `HttpOnly`, `SameSite=Lax` y con vigencia de 24 horas. La URL contiene solo el código público.
- Persistencia: un verificador aleatorio se conserva únicamente como hash SHA-256 y se usa de servidor a servidor al invocar las funciones transaccionales; nunca se entrega al navegador.
- Administración: acceso previsto mediante Supabase Auth y RLS.

Los plazos son configurables. Constituyen una decisión de diseño para la demo, no asesoría ni certificación legal.

## Contenido

`content_entries` separa borradores y contenido publicado por idioma. La interfaz inicial usa datos locales para que la demo compile sin servicios externos; al conectar Supabase, el repositorio debe leer entradas publicadas y el panel debe escribir borradores antes de publicar.

## Integraciones pendientes de credenciales

- Proyecto Supabase y aplicación de migraciones.
- Usuario administrativo creado en Supabase Auth.
- Remitente verificado y API key de Resend.
- Invocación programada del endpoint de recordatorios.
- Número de WhatsApp del restaurante.
- URL pública final para enlaces, PDF y QR.
