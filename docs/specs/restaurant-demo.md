# Spec: L'Oliva Notturna

## Objetivo

Construir una demostración pública de un restaurante italiano ficticio que permita evaluar diseño, internacionalización, reservas y administración sin costes recurrentes obligatorios.

## Usuarios y problema

- Comensal: necesita conocer la propuesta, consultar la carta y gestionar una reserva con pocos pasos.
- Administrador: necesita cambiar contenido, disponibilidad y reservas sin editar código.
- Evaluador de portafolio: necesita recorrer una experiencia convincente sin confundirla con un negocio real.

## Resultado observable

- Sitio elegante y responsive en español, inglés e italiano.
- Carta web y PDF, más accesos QR medibles sin perfilar visitantes.
- Reservas automáticas por mesas y disponibilidad, con correo y WhatsApp complementario.
- Panel autenticado y una demostración pública, explícitamente ficticia, de dicho panel.

## Alcance indispensable

- Selección y persistencia funcional del idioma.
- Carta, historia, experiencias, galería, ubicación ficticia y privacidad.
- Reserva, consulta, modificación y cancelación sin cuenta de cliente.
- Asignación transaccional de mesas, horarios configurables y derivación de grupos grandes.
- Borrador, previsualización y publicación de contenido administrativo.
- Retención reducida, eliminación de notas sensibles y métricas anonimizadas.

## Fuera de alcance

- Pagos, depósitos, programa de fidelidad o marketing.
- Integración pagada con WhatsApp Business.
- Gestión avanzada de roles o múltiples sucursales.
- Dirección, teléfono, dominio o disponibilidad comercial reales.
- Certificación jurídica o declaración de cumplimiento normativo.

## Restricciones

- Priorizar planes gratuitos y no publicar sin autorización separada.
- No almacenar secretos ni datos reales en Git.
- No exponer tokens, hashes o secretos en URLs, respuestas, logs o analítica.
- El repositorio y sus commits deben mostrar únicamente la identidad del propietario.

## Criterios de aceptación

- Las rutas públicas existen en los tres idiomas y comienzan con selección de idioma.
- Un grupo de 1 a 8 personas puede reservar solo una unidad disponible; 9 o más se deriva a WhatsApp.
- Dos reservas concurrentes no pueden compartir una mesa y horario.
- El cliente verifica su correo antes de gestionar una reserva y recibe una cookie firmada `HttpOnly`.
- Modificaciones y cancelaciones respetan sus respectivos plazos.
- PDF y QR responden con formatos válidos.
- El panel real exige identidad verificada en backend; el panel público indica que usa datos ficticios.
- Tipos, lint, pruebas, build y auditoría de dependencias de producción terminan sin fallos.
- Las pruebas UI requeridas que no puedan ejecutarse se informan como omitidas, nunca como aprobadas.

## Riesgos

- Los planes gratuitos pueden pausar proyectos o cambiar límites.
- El envío real de correo requiere dominio/remitente verificado.
- La API pública de verificación necesita rate limiting distribuido antes de tráfico comercial.
- Los textos legales requieren revisión profesional antes de usar datos de clientes reales.
- Las migraciones no se consideran validadas en integración hasta ejecutarse sobre un proyecto Supabase aislado.

## Verificaciones

- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npx next build --webpack`
- `npm audit --omit=dev`
- Pruebas HTTP locales de páginas, PDF, QR y errores controlados.
- Playwright en escritorio y móvil cuando exista un navegador instalado.
