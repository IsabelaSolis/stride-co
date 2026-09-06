#Hola profe, utillizamos 2 ramas, para ver nuestro proyecto, tiene que cambiarse a la rama master, gracis!
# stride-co
Aplicación web para la gestión de ventas, inventario y pedidos de Stride &amp; Co.  
Stride Co. presenta dificultades en la gestión de sus procesos de venta y seguimiento de pedidos, debido a que gran parte de estas actividades se realizan mediante chats y comunicación manual. Esta situación puede ocasionar pérdida o duplicidad de pedidos, falta de información actualizada sobre el inventario y dificultades para consultar el estado de pagos y órdenes. Asimismo, los vendedores y el área de operaciones necesitan mantener una comunicación constante para conocer la disponibilidad de productos, identificar pedidos pendientes y verificar aquellos que ya han sido pagados.  

# Stride & Co. — Backend API

## Datos académicos

| Campo | Detalle |
|---|---|
| **Universidad** | Universidad Autónoma de Chihuahua |
| **Facultad** | Facultad de Ingeniería |
| **Carrera** | Ingeniería en Ciencias de la Computación |
| **Materia** | Web Platforms |
| **Docente** | Mtro. Luis Antonio Ramírez Martínez |
| **Actividad** | Proyecto Integrador — Entregable 1. Configuración inicial del backend |
| **Alumnas** | Isabela Solís, Janely Monreal |
| **Matrícula** | 376827, 377112 |
| **Fecha de entrega** | [06/09/2026] |

## Descripción
Desarrollamos el backend inicial de la aplicación **Stride & Co.**, desarrollado con Node.js y Express Generator. Define la arquitectura base del proyecto (rutas, controladores y respuestas mock) para los principales recursos del sistema: usuarios, roles, permisos, productos, variantes, inventario, clientes y órdenes.

## Objetivo
Configurar la base técnica del backend de Stride & Co., aplicando una separación clara de responsabilidades entre rutas y controladores, así como buenas prácticas de control de versiones, calidad de código y pruebas automatizadas.

## Tecnologías utilizadas
- Node.js
- Express 4 (generado con Express Generator)
- ESLint 10 (`@eslint/js`)
- Jest + Supertest (pruebas automatizadas)
- Morgan (logging de solicitudes HTTP)

## Requisitos previos

- Node.js (versión 20 o superior recomendada)
- npm (incluido con Node.js)
- Git

## Instalación
```bash
git clone https://github.com/IsabelaSolis/stride-co.git
cd stride-co
npm install
```

## Ejecución

```bash
npm start
```

El servidor corre por defecto en `http://localhost:3000`.

Para desarrollo con recarga automática:

```bash
npm run dev
```

## Scripts / comandos disponibles
| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor en modo producción |
| `npm run dev` | Levanta el servidor en modo desarrollo (con `supervisor`) |
| `npm run lint` | Corre ESLint sobre todo el proyecto |
| `npm test` | Corre las pruebas automatizadas con Jest |

## Funcionalidades / uso

Todos los recursos están montados bajo el prefijo `/api/v1/`. En esta etapa **todas las respuestas son mock** (no hay persistencia en base de datos todavía).

| Recurso | Rutas disponibles |
|---|---|
| Usuarios | `GET /api/v1/users`, `GET /api/v1/users/:id`, `POST /api/v1/users`, `PUT /api/v1/users/:id`, `DELETE /api/v1/users/:id` |
| Roles | `GET /api/v1/roles`, `GET /api/v1/roles/:id`, `POST /api/v1/roles`, `PUT /api/v1/roles/:id`, `DELETE /api/v1/roles/:id` |
| Permisos | `GET /api/v1/permissions`, `GET /api/v1/permissions/:id`, `POST /api/v1/permissions`, `PUT /api/v1/permissions/:id`, `DELETE /api/v1/permissions/:id` |
| Roles-Permisos | `GET /api/v1/rolePermissions`, `GET /api/v1/rolePermissions/:roleId`, `POST /api/v1/rolePermissions`, `DELETE /api/v1/rolePermissions/:roleId/:permissionId` |
| Productos | `GET /api/v1/products`, `GET /api/v1/products/:id`, `POST /api/v1/products`, `PUT /api/v1/products/:id`, `DELETE /api/v1/products/:id` |
| Variantes | `GET /api/v1/variants`, `GET /api/v1/variants/:id`, `POST /api/v1/variants`, `PUT /api/v1/variants/:id`, `DELETE /api/v1/variants/:id` |
| Inventario | `GET /api/v1/inventory`, `GET /api/v1/inventory/:id`, `POST /api/v1/inventory`, `PUT /api/v1/inventory/:id`, `DELETE /api/v1/inventory/:id` |
| Clientes | `GET /api/v1/customers`, `GET /api/v1/customers/:id`, `POST /api/v1/customers`, `PUT /api/v1/customers/:id`, `DELETE /api/v1/customers/:id` |
| Órdenes | `GET /api/v1/orders`, `GET /api/v1/orders/:id`, `POST /api/v1/orders`, `PUT /api/v1/orders/:id`, `DELETE /api/v1/orders/:id` |

`rolePermissions` no implementa `PUT`, ya que su llave está compuesta por `roleId` y `permissionId`, y no tiene sentido actualizar una relación en lugar de eliminarla y volver a crearla.



## Pruebas
```bash
npm test
```
Para ver el detalle de cada prueba ejecutada utilizamos un nuevo comando:

```bash
npx jest --verbose
```

Cada recurso cuenta con pruebas que cubren:

- Código HTTP esperado para cada operación (GET, POST, PUT, DELETE).
- Estructura básica de la respuesta (`message` y `data`).
- Funcionamiento de parámetros de ruta (`:id`, `:roleId`, `:permissionId`).
- Manejo de rutas inexistentes (`404`).
- Comportamiento ante solicitudes con body vacío o incompleto.

Evidencia de ejecución:
Se supone que tiene que salir de esta manera 
```
Test Suites: 9 passed, 9 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        5.833 s
Ran all test suites.
```

## Análisis de calidad de código
El proyecto usa ESLint (`eslint.config.js`) con la configuración recomendada de `@eslint/js`, para Node.js (CommonJS) y para los archivos de prueba de Jest.

```bash
npm run lint
```

## Estructura general del proyecto
```text
stride-co/
|-- bin/
|   `-- www
|-- controllers/        # Lógica de cada recurso
|-- routes/              # Definición de endpoints
|-- test/                # Pruebas automatizadas (Jest + Supertest)
|-- public/
|-- views/
|-- app.js
|-- package.json
|-- eslint.config.js
|-- .gitignore
`-- README.md
```

## Control de versiones
- `feat: agregar rutas de products`
- `fix: eliminar node_modules del repositorio`
- `test: agregar pruebas de estructura y solicitudes incorrectas`
- `docs: actualizar README`

## Alcance de esta etapa
Este entregable **no incluye** base de datos, autenticación, autorización, ni reglas de negocio. Estos puntos se incorporarán progresivamente en las siguientes etapas del proyecto.

## Autor
Isabela Jazmin Solís Castillo— 376827
Janely Monreal Torres — 377112
