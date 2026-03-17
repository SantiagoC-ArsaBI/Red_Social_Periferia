# Instrucciones de instalación y ejecución  
## Red Social — Prueba Técnica Periferia IT Group

Este documento describe cómo ejecutar el proyecto completo con Docker Compose. Puede convertirse a PDF para entrega (incluyendo las capturas de pantalla sugeridas que se indican más abajo).

---

## Requisitos previos

- **Docker** y **Docker Compose** instalados en tu máquina.
- En sistemas con Docker Compose V2, el comando puede ser `docker compose` (con espacio) en lugar de `docker-compose`.

---

## Pasos para ejecutar el proyecto

### 1. Clonar el repositorio

Si aún no lo has hecho, clona el repositorio y abre una terminal en la **raíz del proyecto** (donde está el archivo `docker-compose.yml`).

---

### 2. Levantar todos los servicios

En la raíz del proyecto ejecuta:

```bash
docker-compose up --build
```

O, si usas Docker Compose V2:

```bash
docker compose up --build
```

- La primera vez se construirán las imágenes (backend, frontend, seeder) y puede tardar varios minutos.
- El **seeder** se ejecuta una sola vez al inicio: aplica el esquema de la base de datos con Prisma, **crea o actualiza los stored procedures** (`sp_add_like_and_log`, `sp_get_user_feed`) y luego inserta los usuarios de prueba y una publicación por cada uno. No hace falta ejecutar scripts SQL manuales: los procedimientos almacenados son desplegados automáticamente por este servicio.
- Deja la terminal abierta para ver los logs; los servicios quedarán en ejecución.

**Stored Procedures.** El servicio `seeder-service` es el encargado de crear y actualizar los procedimientos almacenados principales (`sp_add_like_and_log`, `sp_get_user_feed`) al inicio. Así se garantiza que la lógica de likes (incluyendo auditoría) y el feed de publicaciones queda desplegada automáticamente al levantar el entorno con Docker; no se requieren pasos manuales ni scripts SQL adicionales.

---

### 3. Comprobar que los servicios están en marcha

Puedes comprobar que los contenedores están activos con:

```bash
docker-compose ps
```

Deberías ver algo similar a:

| Servicio      | Puerto  | Estado   |
|---------------|---------|----------|
| postgres      | 5432    | Up       |
| auth-service  | 3001    | Up       |
| user-service  | 3002    | Up       |
| post-service  | 3003    | Up       |
| frontend      | 5173    | Up       |
| seeder        | —       | Exit 0   |

**Health checks.** Cada microservicio expone **GET `/health`** para comprobaciones de disponibilidad (p. ej. por orquestadores o monitoreo):

- Auth: http://localhost:3001/health  
- User: http://localhost:3002/health  
- Post: http://localhost:3003/health  

La respuesta indica el estado del servicio y de la base de datos.

---

### 4. Abrir la aplicación en el navegador

Abre tu navegador y accede a:

**http://localhost:5173**

Verás la pantalla de **Login** de la Red Social.

---

## Pruebas rápidas

Tras levantar el proyecto, puedes usar los usuarios creados por el seeder. Todos comparten la misma contraseña.

| Correo            | Contraseña |
|-------------------|------------|
| ana@test.com      | clave123   |
| carlos@test.com   | clave123   |
| maria@test.com    | clave123   |

### Flujo sugerido para probar

1. **Iniciar sesión** con `ana@test.com` / `clave123`.
2. Ver el **Feed** con publicaciones de otros usuarios (Carlos y María).
3. Ir a **Perfil** y comprobar que se muestran nombre, apellidos, alias y fecha de nacimiento.
4. Ir a **Crear publicación**, escribir un mensaje y publicar.
5. Abrir una **ventana de incógnito** (o otra pestaña), iniciar sesión con `carlos@test.com` / `clave123`.
6. En una pestaña dar **Like** a una publicación; en la otra pestaña (con otro usuario o la misma) ver cómo el **contador de likes se actualiza en tiempo real** sin recargar la página.
7. Desde una de las pestañas crear una **nueva publicación** y comprobar que aparece automáticamente en el feed de la otra pestaña, sin recargar.

---

## Documentación Swagger de los servicios

Con los servicios en ejecución, puedes consultar la documentación de la API en:

- **Auth Service:** http://localhost:3001/docs  
- **User Service:** http://localhost:3002/docs  
- **Post Service:** http://localhost:3003/docs  

---

## Detener los servicios

Para detener todos los contenedores:

```bash
docker-compose down
```

Para detener y eliminar también los volúmenes (por ejemplo, los datos de la base de datos):

```bash
docker-compose down -v
```

---

## Pruebas automáticas (backend)

En la carpeta `backend/` hay pruebas unitarias (servicios con mocks) y de integración (controladores con supertest). Para ejecutarlas:

```bash
cd backend && npm test
```

---

## Resumen de puertos

| Servicio     | Puerto | Uso                          |
|--------------|--------|------------------------------|
| Frontend     | 5173   | Aplicación web (navegador)    |
| Auth Service | 3001   | Login y JWT                  |
| User Service | 3002   | Perfil de usuario            |
| Post Service | 3003   | Publicaciones y likes (HTTP y WebSocket) |
| PostgreSQL   | 5432   | Base de datos                |


*Documento preparado para la prueba técnica de Red Social con arquitectura de microservicios — Periferia IT Group.*
