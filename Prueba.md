**Periferia IT Group** **Prueba Técnica - Desarrollador Full Stack** **Desarrollo de Red Social con Node.js / React / Java** 

**Objetivo** 

Construir una red social con arquitectura de microservicios, que soporte autenticación segura, perfiles, publicaciones y likes, despliegue en contenedores docker. 

**Entregables** 

reproducibles: repositorio(s) separados backend/frontend, docker-compose para desarrollo, scripts de seed, documentación Swagger, pruebas unitarias y de integración, y un PDF con instalación + video demo. 

**Alcance funcional** 

* Autenticación de usuario (Usuario y clave) 


* Ver publicaciones (Listar publicaciones de otros usuarios) 


* Crear una publicación (Las publicaciones tienen un mensaje, usuario y un fecha de publicación) 


* Ver perfil de usuario (Nombres, Apellidos, Fecha de nacimiento, Alias) 


* Dar likes y verlos en tiempo real (utilizar mqtt ó websocket) 



**Requisitos Técnicos** 

**Backend (Node.js con Nest.js ó Java Spring Boot)** 

* Autenticación: Implementar login con JWT (GET). 


* Servicio de Publicaciones: Creación (POST). 


* Listar publicaciones (GET) 


* Crear publicación (POST) 


* Envió de like (POST) 


* Ver perfil del usuario: (GET) 


* Seeder: Crear scripts de usuarios de prueba al iniciar la aplicación, con una publicación por usuario. 


* Contenedores: Dockerizar los microservicios (DockerFile). 


* Base de Datos: Postgresql utilizando algún ORM y usar por lo minimo 2 PROCEDURE (PLSQL) 



**Frontend** 

* Pantalla de Login. 


* Pantalla de Perfil: Muestra la información del usuario autenticado. 


* Pantalla de Publicaciones: Lista las publicaciones de los demás usuarios con la opción de dar "like" y ver total de likes de una publicación. 


* Crear publicación: Crear una publicación con los campos mensaje y fecha de publicación (Default al guardar). 


* Manejo de Estado: Usar React Context o Zustand. 



**Extras Valorados** 

* Uso de TypeScript y Java 


* Documentación en Swagger para los endpoints del backend. 


* Pruebas unitarias de código 


* Manejo de errores con buenas prácticas. 


* Logs y auditoría en los microservicios 


* Observabilidad 


* Swagger UI accesible en /docs para cada servicio. 



**Entregables Finales** 

* Repositorio en GitHub con backend y frontend. 


* Docker Compose para levantar la base de datos y los microservicios. 


* PDF con la instalación y explicación del proyecto. 


* Script para la base de datos con usuarios predefinidos. 


* Video demostrativo del desarrollo y funcionamiento de la aplicación 


