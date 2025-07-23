# Historical Facts Daily

Aplicación web que muestra hechos históricos diarios generados automáticamente con IA.

## Desarrollo

### Scripts de generación de hechos históricos

- **Producción**: `pnpm generate:fact` - Genera un hecho histórico y lo guarda en la tabla de producción
- **Test**: `pnpm generate:fact:test` - Genera un hecho histórico y lo guarda en la tabla de test
- **Test alternativo**: `pnpm test:fact` - Ejecuta el generador en modo test
- **Verificar datos de test**: `pnpm check:test-data` - Muestra los datos guardados en la tabla de test
- **Migración**: `pnpm migrate` - Ejecuta las migraciones de base de datos

### Modo Test

El modo test utiliza una tabla separada (`historical_facts_test`) para evitar contaminar los datos de producción durante las pruebas. Esto es útil para:

- Probar cambios en el script sin afectar producción
- Validar que la generación de hechos funciona correctamente
- Desarrollo y debugging

### Variables de entorno

Crea un archivo `.env.local` con:

```
GOOGLE_AI_API_KEY=tu_api_key_de_google
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
SUPABASE_SERVICE_KEY=tu_service_role_key_de_supabase
```

### Base de datos

La aplicación usa Supabase con dos tablas:
- `historical_facts` - Datos de producción
- `historical_facts_test` - Datos de test

### Despliegue

El workflow de GitHub Actions se ejecuta automáticamente todos los días para generar un nuevo hecho histórico.

## Arquitectura

- **Framework**: Next.js 14 con App Router
- **UI**: Tailwind CSS + shadcn/ui
- **Base de datos**: Supabase (PostgreSQL)
- **IA**: Google Generative AI (Gemini)
- **Despliegue**: Vercel
