# Guía de Configuración NTechLab

## 📋 Información de la API

**URL Base**: https://videoia.alertasenlinea.com.ar

**Documentación**: https://videoia.alertasenlinea.com.ar/api-docs/

## 🔑 Obtener Acceso

1. Contacta con NTechLab para solicitar acceso a la API
2. Proporciona información sobre tu caso de uso
3. Recibirás:
   - API Key
   - Documentación específica
   - Límites de uso

## 📡 Endpoints Comunes (Verificar con documentación oficial)

La implementación actual incluye estos métodos estándar. **IMPORTANTE**: Debes verificar con la documentación oficial de NTechLab que estos endpoints existen y están correctamente configurados.

### 1. Detección de Rostros
```http
POST /detect
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "image": "https://url-to-image.jpg"
}
```

**Respuesta esperada:**
```json
{
  "faces": [
    {
      "bbox": {
        "x": 100,
        "y": 150,
        "width": 200,
        "height": 250
      },
      "confidence": 0.99
    }
  ]
}
```

### 2. Verificación de Calidad
```http
POST /quality
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "image": "https://url-to-image.jpg"
}
```

**Respuesta esperada:**
```json
{
  "quality_score": 0.85,
  "checks": {
    "lighting": "good",
    "blur": "minimal",
    "face_size": "optimal"
  }
}
```

### 3. Verificación 1:1 (Comparación)
```http
POST /verify
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "image1": "https://url-to-image1.jpg",
  "image2": "https://url-to-image2.jpg"
}
```

**Respuesta esperada:**
```json
{
  "match": true,
  "similarity": 0.92,
  "confidence": 0.95
}
```

### 4. Búsqueda 1:N
```http
POST /search
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "image": "https://url-to-image.jpg",
  "database_id": "your-database-id"
}
```

**Respuesta esperada:**
```json
{
  "matches": [
    {
      "id": "person-123",
      "similarity": 0.94,
      "metadata": {
        "name": "John Doe"
      }
    }
  ]
}
```

### 5. Crear Registro Facial
```http
POST /faces
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "image": "https://url-to-image.jpg",
  "metadata": {
    "user_id": "user-123",
    "name": "John Doe"
  }
}
```

**Respuesta esperada:**
```json
{
  "id": "face-456",
  "created_at": "2025-02-09T10:00:00Z",
  "status": "active"
}
```

## 🔧 Adaptación del Código

Si los endpoints de NTechLab son diferentes, necesitarás modificar:

**Archivo**: `backend/src/services/ntech.service.js`

### Ejemplo de Adaptación

```javascript
// Si tu endpoint de detección es diferente
const detectFaces = async (imageUrl) => {
  try {
    // Cambiar la ruta y estructura según tu API
    const response = await ntechClient.post('/api/v1/face/detect', {
      photo_url: imageUrl,  // Cambiar nombres de campos
      options: {
        max_faces: 1
      }
    });

    // Adaptar la respuesta al formato esperado
    return {
      faces: response.data.results.map(face => ({
        bbox: face.bounding_box,
        confidence: face.score
      }))
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## 🧪 Testing de la API

### Prueba Manual con cURL

```bash
# Test básico de conectividad
curl -X POST https://videoia.alertasenlinea.com.ar/detect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "image": "https://example.com/test-image.jpg"
  }'
```

### Prueba con Postman

1. Importa esta colección:
```json
{
  "info": {
    "name": "NTechLab API Tests"
  },
  "item": [
    {
      "name": "Detect Faces",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json"
          },
          {
            "key": "Authorization",
            "value": "Bearer {{API_KEY}}"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"image\": \"https://example.com/face.jpg\"\n}"
        },
        "url": {
          "raw": "https://videoia.alertasenlinea.com.ar/detect",
          "protocol": "https",
          "host": ["videoia", "alertasenlinea", "com", "ar"],
          "path": ["detect"]
        }
      }
    }
  ]
}
```

## ⚙️ Configuración Avanzada

### Headers Personalizados

Si NTechLab requiere headers adicionales:

```javascript
// backend/src/services/ntech.service.js
const ntechClient = axios.create({
  baseURL: NTECH_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${NTECH_API_KEY}`,
    'X-Custom-Header': 'valor',  // Agregar según necesidad
    'API-Version': 'v1'
  },
  timeout: 30000
});
```

### Manejo de Errores Específicos

```javascript
// Adaptar según códigos de error de NTechLab
const handleNtechError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 401:
        throw new Error('API Key inválida');
      case 429:
        throw new Error('Límite de requests excedido');
      case 400:
        throw new Error('Imagen inválida o parámetros incorrectos');
      default:
        throw new Error(`Error NTechLab: ${error.response.data.message}`);
    }
  }
  throw error;
};
```

## 📊 Límites y Cuotas

Verifica con NTechLab:
- Requests por minuto/hora/día
- Tamaño máximo de imagen
- Formatos de imagen soportados
- Tiempo de retención de datos

## 🔐 Seguridad

1. **Nunca expongas tu API Key** en el código frontend
2. Usa variables de entorno para credenciales
3. Implementa rate limiting en tu backend
4. Usa HTTPS para todas las comunicaciones
5. Implementa logging de todas las llamadas a la API

## 📝 Checklist de Integración

- [ ] API Key obtenida
- [ ] Documentación oficial revisada
- [ ] Endpoints verificados con cURL/Postman
- [ ] Código adaptado a los endpoints reales
- [ ] Manejo de errores implementado
- [ ] Rate limits configurados
- [ ] Logging implementado
- [ ] Testing en ambiente de desarrollo
- [ ] Testing en ambiente de producción

## 🆘 Soporte

Si tienes problemas con la API de NTechLab:

1. Revisa la documentación oficial
2. Verifica tus credenciales
3. Revisa los logs de tu aplicación
4. Contacta al soporte de NTechLab: [su email/portal de soporte]

## 📚 Recursos Adicionales

- Documentación oficial: https://videoia.alertasenlinea.com.ar/api-docs/
- Portal de desarrolladores: [URL si existe]
- Status de la API: [URL si existe]
