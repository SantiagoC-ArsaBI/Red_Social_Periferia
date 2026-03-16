# Auditoría Técnica — Red Social (Microservicios Nest.js, React, Prisma, Docker)

**Rol:** Senior Software Architect / Auditor Senior de Código  
**Alcance:** Arquitectura, Base de Datos/PL-SQL, Seguridad, Buenas Prácticas, Frontend  
**Formato:** Por cada punto se indica **[ESTADO: PASA / RIESGO / FALLA]**, explicación técnica y sugerencia de mejora (código) cuando aplica.

---

## 1. Arquitectura y Microservicios

### 1.1 Separación de responsabilidades (Auth, User, Post)

**[ESTADO: PASA]**

- **Auth-service:** Solo login (POST y GET por requisito), emisión de JWT y validación de credenciales. No expone perfil ni publicaciones.
- **User-service:** Solo perfil del usuario autenticado (`GET /users/profile`), protegido con JWT.
- **Post-service:** Creación y listado de posts, like (vía SP) y WebSocket de likes. Cada servicio tiene su propio `main.ts`, `AppModule` y no importa código de los otros.
- Los tres comparten la misma base de datos y `schema.prisma`; no hay llamadas HTTP entre servicios. El desacoplamiento es por dominio y despliegue; la BD es el punto compartido.

**Sugerencia (opcional, escalabilidad):** Extraer librería común (p. ej. `@app/common`) con `JwtAuthGuard`, configuración JWT y DTOs compartidos para evitar duplicar `jwt-auth.guard.ts` y configuración en cada servicio.

---

### 1.2 Comunicación: JWT (Shared Secret) y WebSockets

**[ESTADO: PASA]**

- **JWT:** Auth firma con `{ sub, email }` y `expiresIn` configurable (`JWT_EXPIRES_IN ?? '7d'`). User y Post validan con `JwtService.verify` usando `JWT_SECRET` desde `ConfigService`. Mismo secreto en los tres servicios vía variables de entorno.
- **WebSockets:** Socket.IO en post-service, path `/likes`, evento `like` con `{ postId, likesCount }`. El frontend se conecta y actualiza el store; la actualización en tiempo real funciona. No se exige JWT en la conexión WebSocket para esta prueba.

**Sugerencia (opcional, endurecer WebSocket):** Si en el futuro solo usuarios autenticados deben recibir eventos, añadir middleware de Socket.IO que verifique el token en el handshake y desconecte si es inválido.

---

### 1.3 Escalabilidad y estructura del monorepo

**[ESTADO: PASA]**

- Nest configurado como monorepo (`nest-cli.json`, `root: "services"`) con proyectos auth-service, user-service, post-service y seeder-service. Un solo `package.json` y un solo `prisma/schema.prisma` en backend. Estructura clara para añadir más servicios.

---

## 2. Base de Datos y PL/SQL (Punto Crítico)

### 2.1 Stored procedure `sp_add_like_and_log`

**[ESTADO: PASA]**

- **Atomicidad:** Los dos `INSERT` (Like y AuditLog) se ejecutan dentro de la transacción implícita de la función en PostgreSQL; si uno falla, se revierte el otro.
- **Transacciones y errores:** Bloque `EXCEPTION` con `unique_violation` → `LIKE_ALREADY_EXISTS` y `foreign_key_violation` → `INVALID_USER_OR_POST`. El servicio en Nest hace catch de esos mensajes y devuelve `BadRequestException` y `NotFoundException` adecuados.
- **Deadlocks:** Orden de escritura consistente (Like y luego AuditLog) reduce riesgo de deadlock entre estas tablas.
- **Constraint único:** El modelo `Like` tiene `@@unique([userId, postId])` en Prisma; el SP alineado con esa restricción.

**Código actual (db/procedures/sp_add_like_and_log.sql):**

```sql
CREATE OR REPLACE FUNCTION sp_add_like_and_log(p_user_id INTEGER, p_post_id INTEGER)
RETURNS VOID AS $$
BEGIN
  INSERT INTO "Like" ("userId", "postId", "createdAt")
  VALUES (p_user_id, p_post_id, NOW());
  INSERT INTO "AuditLog" (action, "userId", "postId", "createdAt")
  VALUES ('LIKE_POST', p_user_id, p_post_id, NOW());
EXCEPTION
  WHEN unique_violation THEN
    RAISE EXCEPTION 'LIKE_ALREADY_EXISTS';
  WHEN foreign_key_violation THEN
    RAISE EXCEPTION 'INVALID_USER_OR_POST';
END;
$$ LANGUAGE plpgsql;
```

No se requieren cambios.

---

### 2.2 Stored procedure `sp_get_user_feed`

**[ESTADO: PASA]**

- El procedimiento está definido en `db/procedures/sp_get_user_feed.sql` y devuelve `post_id`, `author_id`, `message`, `created_at`, `likes_count`, `author_first_name`, `author_last_name`, `author_alias`.
- **Uso en la API:** `findAllOtherUsersPosts` en post-service llama al SP con `$queryRaw` y `Prisma.sql\`SELECT * FROM sp_get_user_feed(${userId})\`` y mapea el resultado al DTO de respuesta (incluyendo autor). El feed cumple el requisito de usar el procedimiento almacenado.
- El seeder crea la misma definición del SP; fuentes alineadas.

No se requieren cambios.

---

### 2.3 Modelado: tablas Auditoría y Likes

**[ESTADO: PASA]**

- **AuditLog:** Campos `action`, `userId`, `postId`, `payload`, `createdAt`. Cada like genera una fila con `userId` y `postId`; rastro claro de quién hizo qué y cuándo.
- **Like:** Modelo con `@@unique([userId, postId])`; normalización correcta y prevención de duplicados a nivel BD.

---

## 3. Seguridad

### 3.1 JWT: expiración, secretos y payload

**[ESTADO: RIESGO]** — Comportamiento correcto; secreto por defecto inadecuado para producción.

- **Expiración:** Configurable con `JWT_EXPIRES_IN` (por defecto `'7d'`). Correcto.
- **Payload:** Solo `sub` (id) y `email`; no se exponen datos sensibles.
- **Secretos:** En `docker-compose.yml` los tres servicios tienen `JWT_SECRET: supersecret` fijo. Para producción debe usarse variable de entorno no versionada.

**Sugerencia:**

```yaml
# docker-compose.yml (producción)
environment:
  JWT_SECRET: ${JWT_SECRET}
  JWT_EXPIRES_IN: ${JWT_EXPIRES_IN:-7d}
```

Documentar en README/INSTRUCCIONES que en producción es obligatorio definir `JWT_SECRET` (y opcionalmente `JWT_EXPIRES_IN`).

---

### 3.2 Inyección SQL en llamadas Prisma

**[ESTADO: PASA]**

- Like: `Prisma.sql\`SELECT sp_add_like_and_log(${userId}, ${postId})\`` usa parámetros vinculados; no hay concatenación de input de usuario.
- Feed: `Prisma.sql\`SELECT * FROM sp_get_user_feed(${userId})\`` igualmente seguro.
- Seeder: `$executeRawUnsafe` solo con strings constantes (definición de funciones). Aceptable en este contexto.

Mantener siempre `Prisma.sql` o `$queryRaw`/`$executeRaw` con parámetros para cualquier valor dinámico.

---

### 3.3 CORS y comunicación frontend ↔ microservicios en Docker

**[ESTADO: PASA]**

- Los tres servicios (auth, user, post) llaman a `app.enableCors({ origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'], credentials: true })`.
- En docker-compose está definido `CORS_ORIGIN: http://localhost:5173` para cada servicio. La comunicación desde el frontend en el mismo host está correctamente permitida.

---

## 4. Buenas Prácticas y Extras Valorados

### 4.1 TypeScript: interfaces y tipos; uso de `any`

**[ESTADO: PASA]**

- No se encontró `: any` ni `as any` en `backend/services` ni en `frontend/src`. DTOs, servicios y stores usan tipos e interfaces explícitos.

---

### 4.2 Documentación Swagger en `/docs`

**[ESTADO: PASA]**

- Cada servicio configura Swagger en `main.ts` y monta la documentación en `docs`. DTOs con `@ApiProperty`; controladores con `@ApiOperation`, `@ApiResponse` y códigos 200, 201, 400, 401, 404 según corresponda. `addBearerAuth()` para JWT.
- El endpoint GET login está documentado con la aclaración: *"Endpoint incluido por requerimiento técnico; la práctica recomendada en producción es usar el login por POST."* — adecuado para el requisito y para seguridad.

---

### 4.3 Logs y auditoría (“quién hizo qué y cuándo”)

**[ESTADO: PASA]** para el requisito explícito de auditoría de likes.

- Cada like inserta en `AuditLog` (vía SP) con `action = 'LIKE_POST'`, `userId`, `postId` y `createdAt`. Existe rastro claro en BD.
- No hay uso de `Logger` de Nest ni logs de aplicación para otras operaciones (crear post, login). Para el alcance de la prueba (auditoría de likes) se cumple; ampliar logs de aplicación sería una mejora opcional.

---

## 5. Frontend (React + Zustand)

### 5.1 Manejo de estado con Zustand

**[ESTADO: PASA]**

- Auth: store con persist y selectores granulares (p. ej. `useAuthStore((s) => s.setAuth)`).
- Posts: store con `posts`, `likedPostIds`, `updateLikeCount`, `setLikedByMe`; WebSocket actualiza vía `usePostsStore.getState().updateLikeCount` fuera del ciclo de React, correcto.
- Sin re-renders innecesarios más allá de lo esperado al actualizar listado o likes.

---

### 5.2 UX/UI: validaciones y feedback en tiempo real

**[ESTADO: PASA]**

- Login: validación de correo y contraseña, mensajes de error, estado de carga, accesibilidad.
- Crear publicación: validación de mensaje, contador de caracteres, errores por campo.
- Feed: manejo de loading, error y lista vacía. Ante 401 (token expirado o inválido), el cliente limpia la sesión y redirige a `/login`, evitando estado inconsistente.

---

## 6. Mejoras implementadas (revisión de auditoría anterior)

| Tema | Estado actual |
|------|----------------|
| CORS | Implementado en los tres servicios con `enableCors` y `CORS_ORIGIN`. |
| Uso de `sp_get_user_feed` en el feed | El feed usa el SP vía `$queryRaw` y mapea correctamente (incl. autor). |
| Constraint único en Like | `@@unique([userId, postId])` en schema y SP con manejo de `unique_violation`. |
| Manejo de errores en SP | Bloque EXCEPTION para `unique_violation` y `foreign_key_violation`; servicio traduce a excepciones HTTP. |
| Validación de id en like | `ParsePositiveIntPipe` custom: solo enteros ≥ 1; mensaje claro en español. |
| Respuesta ante 401 en frontend | En `fetchJson`, si `res.status === 401` se elimina `periferia-auth` de localStorage y se redirige a `/login` antes de lanzar error. |
| Documentación del login GET | Swagger indica que GET es por requerimiento técnico y que en producción se recomienda POST. |

---

## 7. Pendientes y recomendaciones menores

### 7.1 JWT_SECRET en docker-compose (RIESGO ya citado)

- Sustituir valor fijo por variable de entorno en entornos de producción y documentar en README/INSTRUCCIONES.

### 7.2 Inicialización de procedimientos en BD

- **Situación:** `db/init.sql` comenta “Procedimientos en 02_*.sql” pero no existe ese archivo; los SP se crean con el **seeder** (que se ejecuta tras el arranque de postgres). PostgreSQL en Docker solo ejecuta scripts en la raíz de `docker-entrypoint-initdb.d`, no en subcarpetas, por lo que `db/procedures/*.sql` no se ejecutan automáticamente en el primer arranque.
- **Recomendación:** Actualizar `db/init.sql` (o README) para indicar que los procedimientos se crean al ejecutar el seeder, o bien añadir un script en la raíz de `db/` (p. ej. `02_procedures.sql`) que defina los SP para que un despliegue “solo init” también los tenga sin depender del seeder.

**Ejemplo de aclaración en init.sql:**

```sql
-- Tablas creadas por Prisma (migrate/db push).
-- Los procedimientos sp_add_like_and_log y sp_get_user_feed se crean al ejecutar el seeder (backend).
```

### 7.3 WebSocket sin JWT (opcional)

- El gateway de likes no valida el token; cualquiera puede conectar y recibir eventos. Aceptable para la prueba; si se requiere restringir en el futuro, añadir middleware de Socket.IO que verifique JWT.

---

## Resumen de estados

| Área | PASA | RIESGO | FALLA |
|------|------|--------|-------|
| Arquitectura y microservicios | 3 | 0 | 0 |
| Base de datos / PL-SQL | 3 | 0 | 0 |
| Seguridad | 2 | 1 | 0 |
| Buenas prácticas | 3 | 0 | 0 |
| Frontend | 2 | 0 | 0 |

**Conclusión:** El proyecto cumple los requisitos auditados con robustez. Las mejoras solicitadas en auditorías anteriores (CORS, uso del SP de feed, constraint único en Like, manejo de errores en el SP, validación de id positivo, manejo de 401 en frontend y documentación del login GET) están aplicadas. El único **RIESGO** abierto es el uso de `JWT_SECRET` fijo en docker-compose para producción; el resto son recomendaciones menores (documentación de init/procedimientos y, opcionalmente, JWT en WebSocket y logs de aplicación).
