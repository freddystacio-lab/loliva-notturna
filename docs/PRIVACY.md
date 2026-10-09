# Decisiones de privacidad

Este documento registra las decisiones técnicas del proyecto. No reemplaza una revisión jurídica.

## Datos solicitados

- Nombre, correo y teléfono para gestionar la reserva.
- Fecha, hora y cantidad de personas para asignar capacidad.
- Idioma para comunicaciones.
- Alergias, restricciones y comentarios únicamente si el cliente decide informarlos.

## Principios aplicados

- Minimización y propósito explícito.
- Sin cuentas obligatorias para clientes.
- Sin marketing derivado del consentimiento de reserva.
- Sin almacenamiento de IP en la analítica propia.
- Sesión de gestión en cookie firmada `HttpOnly`; ningún token o hash viaja en URL, respuesta, analítica o log.
- Verificadores internos almacenados solo como hash y utilizados exclusivamente desde el servidor.
- Retención corta y anonimización automática.
- Acceso administrativo sujeto a autenticación y RLS.

## Antes de producción

- Revisar textos legales y bases de licitud con asesoría competente.
- Documentar proveedores y transferencias de datos.
- Configurar procedimiento de acceso, corrección, oposición y eliminación.
- Probar restauración, eliminación programada y respuesta a incidentes.
- Revisar los requisitos definitivos de la Ley chilena 21.719 y sus reglamentos aplicables.
