# 🚀 Inicio Rápido - Validación Facial NTechLab

## 📦 Archivos Incluidos

Has recibido una aplicación web completa con:

✅ **Frontend React** - Captura facial con validaciones tipo banco
✅ **Backend Node.js** - API REST con integración NTechLab
✅ **MinIO** - Almacenamiento S3-compatible (incluido, gratis)
✅ **Docker Compose** - Deploy simplificado
✅ **Autenticación Google** - Via Supabase

## 🎯 Próximos Pasos

### 1. **Lee el SETUP_CHECKLIST.md** ⭐ IMPORTANTE
Este archivo contiene una lista paso a paso de TODO lo que necesitas configurar.

### 2. **Configura las Cuentas Necesarias**
- **Supabase** (autenticación): https://supabase.com - GRATIS
- **MinIO** (almacenamiento): Ya incluido en Docker - GRATIS
- **NTechLab** (validación facial): Contacta con ellos directamente

### 3. **Configura las Variables de Entorno**
Copia `.env.example` a `.env` y completa:
- Credenciales de Supabase (obligatorio)
- Credenciales de NTechLab (obligatorio)
- MinIO ya viene preconfigurado con valores por defecto ✅

### 4. **Inicia la Aplicación**
```bash
chmod +x start.sh
./start.sh
```

O manualmente:
```bash
docker-compose up --build
```

### 5. **Accede a la App**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- MinIO Console: http://localhost:9001 (admin/minio123456)

## 📚 Documentación Importante

| Archivo | Descripción |
|---------|-------------|
| `SETUP_CHECKLIST.md` | ⭐ **EMPIEZA AQUÍ** - Checklist completo de configuración |
| `README.md` | Documentación completa de la aplicación |
| `MINIO_GUIDE.md` | Guía completa de MinIO (almacenamiento) |
| `NTECH_SETUP.md` | Configuración específica de NTechLab API |

## ⚠️ IMPORTANTE sobre NTechLab

La documentación de su API no estaba accesible públicamente. El código incluye:

1. **Endpoints estándar** de APIs de reconocimiento facial
2. **Estructura flexible** fácil de adaptar
3. **Guía detallada** en `NTECH_SETUP.md` para adaptarlo

**Debes**:
- Obtener la documentación oficial de NTechLab
- Verificar los endpoints reales
- Adaptar `backend/src/services/ntech.service.js` según sea necesario

## 🏗️ Estructura del Proyecto

```
facial-validation-app/
├── frontend/           # Aplicación React
│   ├── src/
│   │   ├── components/    # Componente de captura facial
│   │   ├── services/      # Servicios de API y Supabase
│   │   └── App.js         # Aplicación principal
│   ├── Dockerfile
│   └── package.json
│
├── backend/            # API Node.js
│   ├── src/
│   │   ├── routes/        # Rutas de la API
│   │   ├── controllers/   # Controladores
│   │   ├── services/      # Servicios (S3, NTechLab)
│   │   └── middleware/    # Auth, errores
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml  # Orquestación de servicios
├── .env.example        # Plantilla de variables
└── start.sh           # Script de inicio rápido
```

## 🔑 Credenciales Necesarias

Necesitarás obtener:

1. **Supabase** (gratis para empezar)
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY

2. **Google Cloud** (para OAuth)
   - Client ID
   - Client Secret

3. **MinIO** (ya incluido, usa valores por defecto)
   - MINIO_ROOT_USER: `admin` (por defecto)
   - MINIO_ROOT_PASSWORD: `minio123456` (por defecto)
   - MINIO_BUCKET_NAME: `facial-validation-photos` (por defecto)
   - ⚠️ **Cambiar en producción por credenciales seguras**

4. **NTechLab**
   - API URL
   - API Key

## ✨ Características Principales

### Frontend
- Captura facial en tiempo real
- Detección de rostro con TensorFlow.js
- Validaciones automáticas (centrado, tamaño, iluminación)
- Cuenta regresiva automática antes de captura
- UI responsive y profesional

### Backend
- Autenticación JWT con Supabase
- Upload optimizado de imágenes a MinIO
- Integración completa con NTechLab
- Rate limiting y seguridad
- Manejo robusto de errores

### MinIO
- Almacenamiento local S3-compatible
- Sin costos de cloud
- Consola web de administración
- 100% compatible con AWS S3
- Fácil migración a AWS S3 si es necesario

## 🆘 ¿Necesitas Ayuda?

1. **Revisa SETUP_CHECKLIST.md** - Cubre el 90% de problemas comunes
2. **Revisa README.md** - Documentación técnica completa
3. **Revisa logs**: `docker-compose logs -f`

## 🎉 ¡Listo!

Una vez configurado todo, tendrás una aplicación profesional de validación facial completamente funcional.

**Tiempo estimado de configuración**: 1-2 horas (la mayoría es crear las cuentas)

**Siguiente paso**: Abre `SETUP_CHECKLIST.md` y sigue los pasos. ✅
