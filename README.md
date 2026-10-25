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
| **Alumnas** | Isabela Jazmín Solís Castillo, Janely Monreal Torres |
| **Matrícula** | 376827, 377112 |
| **Fecha de entrega** | 06/09/2026 |

## Descripción

Aplicación web para la gestión de ventas, inventario y pedidos de Stride & Co. Actualmente, Stride & Co. presenta dificultades en la gestión de sus procesos de venta y seguimiento de pedidos, ya que gran parte de estas actividades se realizan mediante chats y comunicación manual. Esto puede ocasionar pérdida o duplicidad de pedidos, falta de información actualizada sobre el inventario, y dificultades para consultar el estado de pagos y órdenes. Asimismo, vendedores y el área de operaciones necesitan mantener comunicación constante para conocer la disponibilidad de productos, identificar pedidos pendientes y verificar cuáles ya han sido pagados.

Para este entregable, desarrollamos el backend inicial de la aplicación con Node.js y Express Generator, definiendo la arquitectura base del proyecto (rutas, controladores y respuestas mock) para los principales recursos del sistema: usuarios, roles, permisos, productos, variantes, inventario, clientes y órdenes.

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

Para ver el detalle de cada prueba ejecutada:

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

```
Test Suites: 9 passed, 9 total
Tests:       60 passed, 60 total
Snapshots:   0 total
Time:        5.833 s
Ran all test suites.
```

## Análisis de calidad de código

El proyecto usa ESLint (`eslint.config.js`) con la configuración recomendada de `@eslint/js`, adaptada para Node.js (CommonJS) y para los archivos de prueba de Jest.

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

El historial de commits sigue la especificación [Conventional Commits](https://www.conventionalcommits.org/), por ejemplo:

- `feat: agregar rutas de products`
- `fix: eliminar node_modules del repositorio`
- `test: agregar pruebas de estructura y solicitudes incorrectas`
- `docs: actualizar README`

## Alcance de esta etapa

Este entregable **no incluye** base de datos, autenticación, autorización, ni reglas de negocio. Estos puntos se incorporarán progresivamente en las siguientes etapas del proyecto.

## Control de acceso basado en roles
### Roles utilizados

| Rol | Descripción |
|---|---|
| `admin` | Administrador: gestiona productos y consulta usuarios y órdenes. |
| `sales` | Ventas: consulta productos y trabaja con órdenes. |
| `user` | Usuario: consulta productos y gestiona sus propias órdenes. |

### Permisos definidos

| Key | Descripción |
|---|---|
| `products:read:any` | Consultar cualquier producto |
| `products:create:any` | Crear productos |
| `products:update:any` | Actualizar cualquier producto |
| `products:delete:any` | Eliminar cualquier producto |
| `orders:create:any` | Crear órdenes |
| `orders:read:own` | Consultar órdenes propias |
| `orders:read:any` | Consultar cualquier orden |
| `orders:update:own` | Actualizar órdenes propias |
| `users:read:any` | Consultar cualquier usuario |

### Convención utilizada para Permission.key.
Cada permiso se guarda en `Permission.key` con el formato `recurso:acción:alcance`:

```
orders:read:own
  |     |    |
  |     |    +-- alcance: own (solo recursos propios) | any (cualquier recurso)
  |     +------- acción: create | read | update | delete
  +------------- recurso: products | orders | users
```

### Matriz RBAC

| Recurso / operación | ADMIN | SALES | USER |
|---|:---:|:---:|:---:|
| products:read:any | ✓ | ✓ | ✓ |
| products:create:any | ✓ | × | × |
| products:update:any | ✓ | × | × |
| products:delete:any | ✓ | × | × |
| orders:create:any | ✓ | ✓ | ✓ |
| orders:read:own | ✓ | ✓ | ✓ |
| orders:read:any | ✓ | ✓ | × |
| orders:update:own | ✓ | ✓ | ✓ |
| users:read:any | ✓ | × | × |

### Endpoints protegidos
Los siguientes endpoints pasan por el middleware `authorize(resource, action, possession)` antes de llegar al controller. Si el usuario autenticado no tiene el permiso, la API responde `403 Forbidden`.

| Metodo y ruta | Permiso requerido |
|---|---|
| `GET /api/v1/products` | `products:read:any` |
| `GET /api/v1/products/:id` | `products:read:any` |
| `POST /api/v1/products` | `products:create:any` |
| `PUT /api/v1/products/:id` | `products:update:any` |
| `DELETE /api/v1/products/:id` | `products:delete:any` |
| `GET /api/v1/orders` | `orders:read:any` |
| `GET /api/v1/orders/:id` | `orders:read:own` |
| `POST /api/v1/orders` | `orders:create:any` |
| `PUT /api/v1/orders/:id` | `orders:update:own` |
| `GET /api/v1/users` | `users:read:any` |
| `GET /api/v1/users/:id` | `users:read:any` |

El resto de los endpoints requiere únicamente un usuario autenticado, el token JWT valido, sin verificación de permisos por rol.

### Ejemplo de permiso `own`

`orders:read:own` permite consultar solo las órdenes del propio usuario. El middleware compara el dueño real de la orden  con el id del usuario(`req.user.id`). Si no coinciden, responde `403`. Los roles que además tienen `orders:read:any` pasan sin esa comparación.

```javascript
router.get('/:id', authorize('orders', 'read', 'own', orderOwnerId), ordersController.find);
```

### Ejemplo de permiso `any`

`products:delete:any` permite eliminar cualquier producto. El rol `admin` lo tiene; `sales` y `user` no, por lo que reciben `403`.

```javascript
router.delete('/:id', authorize('products', 'delete', 'any'), productController.destroy);
```

### Cómo se obtienen los permisos desde la base de datos

Los permisos no están escritos en el código. Al iniciar el servidor, `bin/www` llama a `loadAccessControl()` (`rbac/accessControl.js`), que:

1. Consulta los roles con sus permisos (`Role -> role_permissions -> Permission`) usando Sequelize.
2. Separa cada `Permission.key` en `resource`, `action` y `possession`.
3. Construye los grants de la librería `accesscontrol` y los guarda en memoria.

En cada petición, `authorize(resource, action, possession)` toma el rol del usuario autenticado (`req.user.role_id`), consulta esos grants y permite o deniega el acceso. Como los permisos se cargan al arrancar, si se modifican roles o permisos hay que reiniciar el servidor.

## Autor

Isabela Jazmín Solís Castillo — 376827
Janely Monreal Torres — 377112