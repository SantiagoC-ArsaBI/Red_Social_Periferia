# Red Social — Periferia IT Group (Prueba Técnica)

Red social con arquitectura de microservicios: autenticación JWT, perfiles, publicaciones y likes en tiempo real vía WebSocket. Backend en Node.js (NestJS) y frontend en React (TypeScript, Zustand). Las **publicaciones nuevas** también se propagan en tiempo real al feed de otros usuarios conectados.

## Cómo ejecutar el proyecto

Para pasos detallados de instalación, ejecución con Docker Compose y pruebas rápidas, consulta **[INSTRUCCIONES.md](INSTRUCCIONES.md)**. Ese documento está pensado para convertirse a PDF (con las capturas de pantalla sugeridas indicadas en el texto).

Resumen:

```bash
docker-compose up --build
```

Luego abre **http://localhost:5173** en el navegador. Usuarios de prueba (creados por el seeder): `ana@test.com`, `carlos@test.com`, `maria@test.com` — contraseña: `clave123`.

---

## Documentación Swagger (API)

Con los servicios levantados (por ejemplo con `docker-compose up`), la documentación interactiva de cada microservicio está disponible en:

| Servicio      | URL                      |
|---------------|--------------------------|
| Auth Service  | http://localhost:3001/docs |
| User Service  | http://localhost:3002/docs |
| Post Service  | http://localhost:3003/docs |

En cada ruta `/docs` se describe los endpoints de ese servicio (login, perfil, publicaciones, likes).

---

## Observabilidad y pruebas

### Health checks

Cada microservicio expone un endpoint **GET `/health`** (sin autenticación) para comprobar disponibilidad y estado de la conexión a PostgreSQL. Útil para orquestadores (Docker, Kubernetes) y monitoreo:

| Servicio      | URL de health              |
|---------------|----------------------------|
| Auth Service  | http://localhost:3001/health |
| User Service  | http://localhost:3002/health |
| Post Service  | http://localhost:3003/health |

La respuesta incluye el estado del servicio y del indicador `database` (p. ej. `{ "status": "ok", "info": { "database": { "status": "up" } } }`). Implementado con `@nestjs/terminus` y `PrismaHealthIndicator`.

### Pruebas automáticas

En el backend (`backend/`) se incluyen:

- **Pruebas unitarias:** `AuthService`, `UserService` y `PostService` (Jest, mocks de Prisma y dependencias). Archivos: `auth.service.spec.ts`, `user.service.spec.ts`, `post.service.spec.ts`.
- **Pruebas de integración:** controladores HTTP con módulos de prueba y mocks (supertest). Archivos: `auth.controller.spec.ts`, `user.controller.spec.ts`, `post.controller.spec.ts`.

Para ejecutar todas las pruebas:

```bash
cd backend && npm test
```

---

## Pasos sugeridos para el video demo

1. **Inicio y login (Ana)**  
   Mostrar la pantalla de login e iniciar sesión con `ana@test.com` / `clave123`. Comprobar redirección al Feed.

2. **Feed y perfil**  
   Recorrer el Feed (publicaciones de otros usuarios), luego ir a Perfil y mostrar nombre, apellidos, alias y fecha de nacimiento.

3. **Crear publicación**  
   Ir a “Crear publicación”, escribir un mensaje (y opcionalmente elegir fecha), validar que no se puede enviar mensaje vacío, y publicar. Volver al Feed.

4. **Segundo usuario (Carlos) en incógnito**  
   Abrir una ventana de incógnito (o otro navegador), ir a http://localhost:5173 e iniciar sesión con `carlos@test.com` / `clave123`. Dejar esta ventana con el Feed visible.

5. **Likes y publicaciones en tiempo real**  
   En la ventana normal (Ana), dar “Like” a una publicación. En la ventana de incógnito (Carlos) mostrar que el **contador de likes de esa publicación se actualiza al instante** sin recargar la página.  
   Luego, desde una de las ventanas crear una **nueva publicación** y comprobar que aparece automáticamente en el feed de la otra ventana (otro usuario) gracias al mismo WebSocket del Post Service.

6. **Cierre**  
   Mencionar que el contador se mantiene sincronizado entre pestañas gracias al WebSocket del Post Service.

---

## Estructura del repositorio

- `backend/` — Monorepo NestJS: auth-service, user-service, post-service, seeder-service. Prisma, PostgreSQL, Swagger en `/docs`.
- `frontend/` — React (Vite, TypeScript, Zustand, Tailwind). Login, Feed, Perfil, Crear publicación; WebSocket para likes en tiempo real.
- `db/` — Scripts SQL y procedimientos almacenados (por ejemplo `sp_add_like_and_log`).
- `docker-compose.yml` — Orquestación de todos los servicios (Postgres con healthcheck, microservicios con `depends_on: service_healthy`).

---

## Estado de auditoría y seguridad

Este proyecto ha sido auditado (ver `AUDITORIA.md`) y se han aplicado medidas de endurecimiento adicionales:

- **CORS configurado explícitamente** en cada microservicio backend (Auth, User, Post) mediante `app.enableCors`, con orígenes permitidos configurables vía variable de entorno `CORS_ORIGIN` (por defecto incluye `http://localhost:5173` para el frontend).
- **Transacciones atómicas y manejo de errores en likes** a través del stored procedure `sp_add_like_and_log`, que ejecuta el alta de like y su registro en `AuditLog` en una única operación y captura conflictos de integridad (por ejemplo, likes duplicados o referencias inválidas) con un bloque `EXCEPTION`.
- **Validación de integridad en la tabla `Like`** con la constraint `@@unique([userId, postId])` en `schema.prisma`, evitando duplicados a nivel de base de datos incluso bajo condiciones de alta concurrencia.

Además, las llamadas SQL crudas desde Prisma utilizan `$queryRaw` / `$executeRaw` con parámetros enlazados (`Prisma.sql\`...\``) para proteger frente a inyección SQL, y los tokens JWT tienen expiración configurable (`JWT_EXPIRES_IN`) y un secreto compartido (`JWT_SECRET`) que debe gestionarse como secreto en entornos reales.
