# Contexto y Estándares: Backend NestJS (Clean / Hexagonal)

## Arquitectura del Proyecto
Sigue una arquitectura Clean/Hexagonal por microservicio:
- `src/main.ts`: Configuración de Swagger (`SwaggerModule` + `patchNestJsSwagger` / `nestjs-zod`), Helmet, CORS y ValidationPipes globales.
- `src/config/`: Entorno tipado + validación Zod.
- `src/common/`: 
  - `filters/`: Global Exception Filter (formato RFC 7807 sin fugar trazas).
  - `guards/`: Custom Throttler Guard (Rate Limit con Redis + X-Forwarded-For).
  - `interceptors/`: ZodSerializerInterceptor, LoggingInterceptor y Prometheus Metrics Interceptor.
- `src/shared/`: Result, logger port, errores base.
- `src/modules/<domain>/`:
  - `domain/`: Entities, value-objects, ports, exceptions (NÚCLEO).
  - `application/`: Use-cases que orquestan el dominio.
  - `infrastructure/`:
    - `persistence/`: TypeORM entities, repositories.
    - `cache/`: Redis (caché, idempotencia, locks distibuidos).
    - `messaging/`: AWS SNS publisher / SQS consumers.
    - `clients/`: Conexión interna a otros microservicios DEAL.
    - `integrations/`: APIs externas (bank, sap, azure) + ACL.
    - `secrets/`: AWS Secrets Manager provider.
  - `interface/`:
    - `controllers/`: Endpoints REST con decoradores OpenAPI (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`).
    - `dto/`: Esquemas Zod exportados vía `createZodDto(schema)` para auto-generar la especificación Swagger.
    - `mappers/`: Transformación explícita entre Domain Entities y Zod DTOs.
    - `webhooks/` & `realtime/`: Consumidores de eventos y Server-Sent Events (SSE).
- `src/health/`: Health checks (Liveness/Readiness) para Fargate.
- `db/migration/`: Migraciones Flyway / TypeORM.

## Convenciones Transversales
1. **TypeScript Estricto**: Prohibido el uso de `any`. `strict: true` activado.
2. **Zod = Fuente Única & Swagger**:
   - DTOs definidos con `nestjs-zod` (`createZodDto(schema)`).
   - Descripciones y ejemplos de Swagger viven en el esquema Zod (`z.string().describe('...')`).
3. **Seguridad y Resiliencia**:
   - Rate limiting respaldado por Redis para arquitectura distribuida.
   - Cero Secretos: `.env` en local, AWS Secrets Manager en producción.
4. **Git**: Conventional Commits + Trunk-Based Development.

---

## Suite de Agentes (.claude/commands/)

### /generate-schema
Genera el esquema Zod en `interface/dto/`, inyecta anotaciones OpenAPI (`.describe()`) y exporta los DTOs usando `createZodDto`.

### /scaffold
Crea un nuevo módulo vertical respetando las capas (`domain/`, `application/`, `infrastructure/`, `interface/`) e incluye la configuración base de Swagger en el controlador.

### /wire-method
Cablea un caso de uso desde `interface/controllers` (inyectando decoradores `@ApiOperation` y `@ApiResponse`) pasando por `application/use-cases` hasta `infrastructure/persistence`.

### /update-docs
Sincroniza la especificación Swagger/OpenAPI. Revisa que todos los endpoints en `interface/controllers/` tengan etiquetas, códigos de respuesta HTTP (200, 400, 401, 403, 500) y autenticación Bearer documentada.

### /generate-mapper
Crea Mappers puros en `interface/mappers/` para transformar entre `domain/entities` y DTOs de Zod.

### /refactor-performance
Audita la capa de `infrastructure/` en busca de consultas N+1, operaciones síncronas bloqueantes y sugiere el uso de caché/locks con Redis.

### /review-security
Audita el código buscando OWASP Top 10 (Inyecciones, Rate Limit, IDOR, fugas de secretos). Inyecta `STATUS: FAILED_SECURITY_AUDIT` si detecta fallos para bloquear el pipeline de CI/CD.

### /review-orm
Audita que las consultas en `infrastructure/persistence` estén parametrizadas, usen transacciones en escrituras múltiples y mantengan tipos explícitos.

### /manage-migration
Revisa o genera migraciones en `db/migration/` advirtiendo cambios destructivos (`DROP`) y garantizando la función `down()`.

### /doctor
Ejecuta la batería completa de diagnósticos:
1. `tsc --noEmit` y verificación de cero `any`.
2. Linter & Prettier.
3. Escaneo de secretos (AWS Secrets Manager check).
4. Verificación de Zod DTOs y compatibilidad con Swagger/OpenAPI en `interface/`.
5. Auditoría de seguridad OWASP y Rate Limiting (Redis).
6. Verificación de Health Checks y Exception Filters globales.
Devuelve un reporte visual con ✅/❌.