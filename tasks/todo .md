# Mejora integral y colaboración profesional — Backend

## Objetivo

Proveer contratos autenticados y seguros para roles de cuenta, vínculos revocables entre productores y profesionales, consulta de clientes, devoluciones clínicas y procedencia trazable del BCS.

## Criterios de aceptación

- [x] Roles validados: `producer`, `veterinarian` y `professional`.
- [x] El rol se devuelve en registro, login y perfil y no puede elevarse desde el perfil.
- [x] El productor solicita, consulta y revoca vínculos profesionales por correo.
- [x] El profesional acepta o rechaza solicitudes y sólo lista clientes con acceso activo.
- [x] Vacas y análisis compartidos son de solo lectura y están aislados por productor.
- [x] Las devoluciones admiten evaluación, recomendaciones, links, imágenes de ejemplo y BCS sugerido.
- [x] Una sugerencia sólo modifica el resultado cuando el productor la aplica explícitamente.
- [x] `modelScore` es inmutable; el score efectivo registra fuente, actor, fecha, motivo y review aplicada.
- [x] Override y restauración sobreviven el round-trip Android → API → snapshot.
- [x] Toda mutación profesional revalida el vínculo activo; una sugerencia aplicada no puede cambiar.
- [x] Las migraciones son reversibles y una base vacía puede crear extensión UUID y tabla `user`.
- [x] JWT no posee secreto fallback y el CRUD de usuarios está limitado al actor autenticado.

## Decisiones

- Cada productor representa un campo/tenant en esta primera vertical; `Farm` queda para una migración posterior.
- Compartir acceso no transfiere propiedad.
- El profesional tiene lectura y devolución, nunca escritura directa sobre ganado o análisis.
- Los resultados ajenos y vínculos inexistentes responden como no encontrados para evitar enumeración.
- Una cuenta con historial o vínculos retenidos no se elimina: la API responde `409 Conflict`.

## Plan

- [x] Auditar autenticación, usuarios, BCS, sync, repositorios y migraciones.
- [x] Implementar roles y endurecimiento de identidad/autorización.
- [x] Implementar solicitudes, aceptación, rechazo, revocación y cartera de clientes.
- [x] Implementar lectura profesional de vacas/análisis.
- [x] Implementar devoluciones profesionales y referencias multimedia.
- [x] Implementar override, restauración y aplicación explícita de sugerencias.
- [x] Corregir el round-trip de procedencia BCS y permisos revocados.
- [x] Hacer reproducibles las migraciones y explícita la retención de cuentas vinculadas.
- [x] Limpiar TypeScript/ESLint sin desactivar reglas.
- [x] Ejecutar typecheck, tests, build y revisión del diff.

## Verificación

- `pnpm exec eslint "{src,apps,libs,test}/**/*.ts"`: OK, 0 errores y 0 warnings.
- `pnpm exec tsc -p tsconfig.build.json --noEmit --incremental false`: OK.
- `pnpm exec jest --runInBand --no-cache`: OK, 18 suites y 110 tests.
- `pnpm run build`: OK.
- `git diff --check`: OK; sólo avisos informativos CRLF de Git para Windows.

## Revisión

La implementación conserva el score original del modelo aun cuando el productor lo corrige o acepta una recomendación. El backend vuelve a validar propiedad y acceso activo en cada operación, evita que una recomendación aplicada cambie retroactivamente y prueba el aislamiento entre productores/profesionales. No se ejecutaron migraciones contra una base externa porque el entorno no dispone de PostgreSQL efímero/Docker; las migraciones se validaron mediante tests de contrato SQL y build.

---

## Recuperación segura de contraseña

- [x] Reemplazar el código global legacy por challenges vinculados a un `requestId`.
- [x] Responder con el mismo contrato para correos existentes e inexistentes y mitigar diferencias temporales.
- [x] Generar código/token con CSPRNG y almacenar únicamente hashes HMAC separados por propósito.
- [x] Limitar reenvíos e intentos; expirar y consumir challenges una sola vez.
- [x] Cambiar contraseña, consumir el challenge e incrementar `tokenVersion` atómicamente.
- [x] Revocar JWT previos también al cambiar la contraseña desde el perfil.
- [x] Exigir nombre en registro, normalizar correos y respetar el límite bcrypt de 72 bytes UTF-8.
- [x] Añadir migración, Swagger y pruebas de expiración, intentos, concurrencia y single-use.
- [x] Ejecutar ESLint, typecheck, Jest y build antes de publicar.

### Revisión

El flujo legacy inseguro fue reemplazado por `request → verify → confirm`. Los secretos no se almacenan en claro, el cooldown se serializa por correo en PostgreSQL y cada verificación/confirmación se consume una sola vez. El cambio de clave invalida las sesiones JWT emitidas anteriormente. El throttling HTTP queda seguro por defecto con `TRUST_PROXY_HOPS=0`; cada despliegue detrás de proxy debe configurar el número exacto de saltos. Para múltiples réplicas se documentó almacenamiento distribuido de throttling y outbox de correo como evolución operativa.

Verificación final: ESLint sin hallazgos, TypeScript OK, build OK y Jest con 21 suites/119 tests aprobados. `git diff --check` no reportó errores.
