# JWT Shared Secret – Validación en User y Post Service

El **Auth Service** firma los tokens con un secreto configurado por variable de entorno:

- **Variable:** `JWT_SECRET`
- **Ejemplo:** `JWT_SECRET=supersecret` (en producción usar un valor seguro y distinto).

Para que **user-service** y **post-service** puedan validar el JWT **sin consultar la base de datos**, deben usar **exactamente el mismo valor** de `JWT_SECRET`.

## Configuración en cada microservicio

1. **docker-compose / entorno:**  
   Definir la misma variable para todos los servicios que validen el token:
   ```yaml
   environment:
     JWT_SECRET: ${JWT_SECRET:-supersecret}
   ```

2. **En user-service y post-service (NestJS):**  
   Configurar el módulo JWT para **verificar** (no firmar) con el mismo secreto:
   ```ts
   JwtModule.register({
     secret: process.env.JWT_SECRET,
     signOptions: { expiresIn: '7d' },
   })
   ```
   Y usar un **Guard** que valide el Bearer token con `JwtService.verify(token)` (o Passport JWT strategy con el mismo `secretOrKey: process.env.JWT_SECRET`).

Así, cualquier request que llegue con `Authorization: Bearer <token>` puede ser validado localmente con el shared secret, sin llamar al Auth Service ni a la DB.
