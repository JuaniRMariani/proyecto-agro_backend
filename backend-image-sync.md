# Backend: imágenes en sincronización (Cloudinary)

Este documento resume lo que el backend debe implementar para soportar el flujo de imágenes offline‑first.

## 1) Endpoint de firma (upload directo)
**POST** `/api/images/signature`

**Request**
```json
{
  "scoreId": "<analysis-id>"
}
```

**Response (mínimo)**
```json
{
  "signature": "<string>",
  "timestamp": 1730000000,
  "apiKey": "<cloudinary_api_key>",
  "cloudName": "<cloudinary_cloud_name>",
  "folder": "analysis",
  "publicId": "analysis_<analysis-id>",
  "uploadUrl": "https://api.cloudinary.com/v1_1/<cloudName>/image/upload"
}
```

**Notas**
- La firma debe generarse con el `api_secret` (solo backend).
- Validar autenticación/permiso para el `scoreId`.
- Enviar `uploadUrl` o `cloudName` (uno de los dos es suficiente).
- (Opcional) aplicar reglas de tamaño/tipo/transformaciones.

## 2) Sincronización: payload de análisis con imagen
En el sync actual, cada análisis (`score`) ahora puede incluir:
- `imageUrl` (string | null)
- `imagePublicId` (string | null)

Ejemplo dentro de `scores`:
```json
{
  "id": "<score-id>",
  "cowTagNumber": "123",
  "score": 3,
  "recordedAt": 1730000000,
  "observation": "...",
  "createdAt": 1730000000,
  "updatedAt": 1730000000,
  "syncAt": 1730000000,
  "deleted": false,
  "imageUrl": "https://res.cloudinary.com/.../image/upload/...jpg",
  "imagePublicId": "analysis_<score-id>"
}
```

## 3) Persistencia en backend
- Guardar `imageUrl` + `imagePublicId` en la entidad de análisis.
- No sobrescribir si el backend tiene una versión más reciente (comparar `updatedAt`).

## 4) Sync response (pull de imágenes)
- Incluir `imageUrl` + `imagePublicId` cuando se devuelven análisis.
- Esto permite que la app muestre imágenes de análisis creados fuera del dispositivo.

## 5) Compatibilidad
- Aceptar `imageUrl`/`imagePublicId` como `null`.
- No romper clientes antiguos.

## 6) Seguridad y límites
- Validar MIME/type y tamaño máximo en Cloudinary (vía presets o reglas).
- `publicId` recomendado: `analysis_<scoreId>` para deduplicación.
- Si se desea, el backend puede forzar carpeta/transformación en la firma.
