# Face Recognition - CI/CD Pipeline

Este proyecto utiliza GitHub Actions para automatizar el build y publicación de imágenes Docker.

## 🚀 Cómo Funciona

### Build Automático
Cada vez que hagas push a cualquier branch, GitHub Actions automáticamente:
1. Construye las imágenes Docker del frontend y backend
2. Las publica en GitHub Container Registry (GHCR)
3. Las etiqueta con:
   - `latest` (solo en el branch principal)
   - Nombre del branch
   - SHA del commit

### Imágenes Publicadas
Las imágenes se publican en:
- **Frontend**: `ghcr.io/alertasenlinea/facerecognition-frontend:latest`
- **Backend**: `ghcr.io/alertasenlinea/facerecognition-backend:latest`

## 📦 Uso

### Producción (Imágenes Pre-buildeadas)
Para usar las imágenes ya construidas desde GHCR:

```bash
# Descargar las últimas imágenes
docker-compose pull

# Iniciar los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f
```

### Desarrollo Local
Para desarrollo local con hot-reload:

```bash
# Usar el archivo de desarrollo
docker-compose -f docker-compose.dev.yml up --build

# O con hot-reload
docker-compose -f docker-compose.dev.yml up
```

## 🔐 Autenticación

Para descargar imágenes privadas de GHCR, necesitas autenticarte:

```bash
# Crear un Personal Access Token en GitHub con permisos read:packages
echo YOUR_GITHUB_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

## 🔄 Actualizar Imágenes

Para obtener las últimas versiones:

```bash
docker-compose pull
docker-compose up -d
```

## 🛠️ Variables de Entorno

Asegúrate de tener un archivo `.env` con:

```env
SUPABASE_URL=tu_supabase_url
SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_KEY=tu_supabase_service_key
NTECH_API_URL=tu_ntech_api_url
NTECH_API_KEY=tu_ntech_api_key
```

## 📝 Notas

- El workflow se ejecuta automáticamente en cada push
- Puedes ejecutarlo manualmente desde la pestaña "Actions" en GitHub
- Las imágenes se cachean para builds más rápidos
- El `docker-compose.yml` principal usa imágenes pre-buildeadas
- El `docker-compose.dev.yml` construye localmente para desarrollo
