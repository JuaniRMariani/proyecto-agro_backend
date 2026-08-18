# Lecciones

- Al ampliar un modelo sincronizado con metadata de procedencia, verificar el flujo completo dispositivo → sync → snapshot → Room. Un DTO compatible no alcanza: la actualización de registros existentes debe preservar `modelScore` y aplicar/restaurar explícitamente el estado efectivo.
- Toda mutación profesional debe volver a validar que el grant siga activo en el momento de escribir; haber sido autor o haber tenido acceso al crear no conserva autorización después de una revocación.
- Cuando una recomendación ya fue aplicada, bloquear cambios que invaliden su trazabilidad, especialmente `suggestedScore` y el retroceso de estado publicado.
- Un flujo de recuperación no debe construirse sobre un código global: cada intento necesita identidad opaca propia, hashes con separación de propósito, expiración, límite de intentos, consumo atómico y respuesta que no enumere cuentas.
- bcrypt sólo distingue con seguridad los primeros 72 bytes; registro, perfil, recuperación y cliente móvil deben aplicar la misma política sobre bytes UTF-8, no sobre cantidad de caracteres.
- Todo cambio de credenciales debe incrementar la versión de sesión en la misma transacción; proteger sólo el endpoint de recuperación deja rutas laterales con JWT antiguos todavía válidos.
- La confianza en `X-Forwarded-For` debe estar deshabilitada por defecto y habilitarse sólo con el número exacto de proxies del despliegue.
