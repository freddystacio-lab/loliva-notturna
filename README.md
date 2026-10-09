# L'Oliva Notturna

Demo de un restaurante italiano contemporáneo ficticio ubicado en Viña del Mar. El proyecto combina una experiencia pública trilingüe con reservas automáticas, carta descargable y un panel administrativo de demostración.

> Este repositorio es un proyecto de portafolio. L'Oliva Notturna no es un restaurante real y su ubicación es ficticia.

## Stack

- Next.js 16 con App Router y TypeScript
- React 19 y Tailwind CSS 4
- `next-intl` para español, inglés e italiano
- Supabase: PostgreSQL, Auth, Storage y políticas RLS
- Resend para correos transaccionales
- `pdf-lib` y `qrcode` para carta PDF y códigos QR
- Vitest y Playwright

## Funciones incluidas

- Pantalla inicial de selección de idioma con preferencia local.
- Inicio, carta, historia, experiencias, galería y contacto.
- Carta trilingüe con iconos dietarios y precios en CLP.
- Carta PDF generada bajo demanda.
- QR descargables para inicio, carta y reservas.
- Formulario de reserva con derivación de grupos grandes a WhatsApp.
- Asignación atómica de mesas y combinaciones en PostgreSQL.
- Enlace seguro para consultar y cancelar una reserva.
- Retención reducida y anonimización de datos personales.
- Panel administrativo de demostración en `/admin/demo`.
- Fotografías editoriales originales generadas para el proyecto.

## Desarrollo local

Requisitos: Node.js 22 y npm 10 o superiores.

```bash
npm install
cp .env.example .env.local
npm run dev
```

La web queda disponible en `http://localhost:3000`.

## Variables de entorno

Consulta [`.env.example`](./.env.example). Las funciones públicas pueden revisarse sin credenciales, pero las reservas reales requieren un proyecto de Supabase. Los correos requieren una cuenta y remitente verificado en Resend.

Nunca agregues `.env.local`, claves de servicio ni datos reales al repositorio.

## Base de datos

Las migraciones están en [`supabase/migrations`](./supabase/migrations):

1. Modelo, mesas, horarios, contenido, privacidad y RLS.
2. Creación atómica de reservas para evitar dobles asignaciones.
3. Cancelación segura mediante verificador interno no expuesto al cliente.
4. Campos de control para recordatorios.
5. Modificación atómica de fecha, hora y cantidad de personas.

Ejecuta las migraciones en orden desde Supabase CLI o el editor SQL del proyecto.

## Verificaciones

```bash
npm run typecheck
npm run lint
npm test
npm run test:e2e
npm run build
```

## Publicación

El proyecto está preparado para Vercel y Supabase. Configura un programador autorizado para invocar `/api/cron/reminders` con `Authorization: Bearer $CRON_SECRET` y procesar los recordatorios.

No se ha publicado ni conectado a servicios externos desde este repositorio.

Antes de convertirlo en un sitio comercial real se debe revisar el contenido legal, configurar dominio y correo, validar los flujos con el restaurante y realizar una revisión jurídica de protección de datos.
