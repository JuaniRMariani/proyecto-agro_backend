# Lecciones

- Al ampliar un modelo sincronizado con metadata de procedencia, verificar el flujo completo dispositivo → sync → snapshot → Room. Un DTO compatible no alcanza: la actualización de registros existentes debe preservar `modelScore` y aplicar/restaurar explícitamente el estado efectivo.
- Toda mutación profesional debe volver a validar que el grant siga activo en el momento de escribir; haber sido autor o haber tenido acceso al crear no conserva autorización después de una revocación.
- Cuando una recomendación ya fue aplicada, bloquear cambios que invaliden su trazabilidad, especialmente `suggestedScore` y el retroceso de estado publicado.
