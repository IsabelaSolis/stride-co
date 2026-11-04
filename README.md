# Stride & Co. — Backend API

## Datos académicos

| Campo | Detalle |
|---|---|
| **Universidad** | Universidad Autónoma de Chihuahua |
| **Facultad** | Facultad de Ingeniería |
| **Carrera** | Ingeniería en Ciencias de la Computación |
| **Materia** | Web Platforms |
| **Docente** | Mtro. Luis Antonio Ramírez Martínez |
| **Actividad** | Proyecto Integrador — Entregable 2. Backend completo, internacionalizado y desplegado sin costo |
| **Alumnas** | Isabela Jazmín Solís Castillo, Janely Monreal Torres |
| **Matrícula** | 376827, 377112 |

## Descripción

Aplicación web para la gestión de ventas, inventario y pedidos de Stride & Co. Actualmente, Stride & Co. presenta dificultades en la gestión de sus procesos de venta y seguimiento de pedidos, ya que gran parte de estas actividades se realizan mediante chats y comunicación manual. Esto puede ocasionar pérdida o duplicidad de pedidos, falta de información actualizada sobre el inventario, y dificultades para consultar el estado de pagos y órdenes. Asimismo, vendedores y el área de operaciones necesitan mantener comunicación constante para conocer la disponibilidad de productos, identificar pedidos pendientes y verificar cuáles ya han sido pagados.

Este entregable completa el backend: todas las rutas persisten su información en PostgreSQL (Sequelize) o MongoDB (Mongoose), están protegidas con JWT y con control de acceso basado en roles (RBAC), responden en español e inglés, leen su configuración y sus secretos por entorno y se despliegan sin costo en Render, Render PostgreSQL y MongoDB Atlas.

## Objetivo

Completar el backend de Stride & Co. para que todas las rutas de la API sean funcionales, persistan la información con su ORM/ODM, estén protegidas con JWT y RBAC, respondan en varios idiomas, lean su configuración por entorno, se desplieguen sin costo y se validen con pruebas con mocks y pruebas end-to-end (E2E) con Jest y Supertest.

## Tecnologías utilizadas

- Node.js y Express 4
- PostgreSQL con Sequelize
- MongoDB con Mongoose
- JWT (`express-jwt`, `jsonwebtoken`) y `bcrypt` para la autenticación y el almacenamiento seguro de contraseñas
- `accesscontrol` para el control de acceso basado en roles
- `i18n` para la internacionalización (español e inglés)
- `config` para la configuración por entornos y los secretos
- Pug (vistas), Morgan (logging de solicitudes HTTP)
- ESLint 10 (`@eslint/js`)
- Jest y Supertest (pruebas con mocks y pruebas E2E)
- Docker, Render y MongoDB Atlas
- Google Antigravity

## Requisitos previos

- Node.js 22 (el mismo que usa el `Dockerfile`)
- npm (incluido con Node.js)
- PostgreSQL
- MongoDB
- Git

## Instalación desde cero

1. Clonar el repositorio y cambiarse a la rama de entrega:

```bash
git clone https://github.com/IsabelaSolis/stride-co.git
cd stride-co
git checkout staging
npm install
```

2. Crear la base de datos relacional vacía (el nombre debe coincidir con `sql.database`, por defecto `stride_co`). Con `psql`:

```bash
psql -U postgres -c "CREATE DATABASE stride_co;"
```

3. Crear el archivo de secretos de desarrollo a partir de la plantilla. El archivo `config/local-development.json` **no se sube a git**:

```bash
# Windows 
Copy-Item config/local-development.example.json config/local-development.json
```

4. Editar `config/local-development.json` con un secreto para los tokens y la contraseña del usuario de PostgreSQL:

```json
{
    "jwt": {
        "secret": "UN_SECRETO_LARGO_Y_ALEATORIO"
    },
    "sql": {
        "password": "LA_PASSWORD_DE_TU_POSTGRESQL"
    }
}
```

Para generar el secreto:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Si tu PostgreSQL usa otro usuario o puerto, agrégalos dentro de `sql` en ese mismo archivo.

## Bases de datos y datos iniciales (seed)

En desarrollo se usan **PostgreSQL** y **MongoDB** locales. La URI de MongoDB por defecto es `mongodb://localhost:27017/stride_co`; para usar un cluster de Atlas se cambia `mongo.uri` en `config/local-development.json`.

Las tablas de PostgreSQL se crean solas al arrancar el servidor o al ejecutar el seed. Para cargar los datos iniciales:

```bash
npm run seed
```

El seed crea:

- los **3 roles**, los **37 permisos** y sus relaciones (`role_permissions`) según la matriz RBAC de este documento;
- **un usuario activo por cada rol** (usuarios de demostración);
- datos de ejemplo de cada recurso: 2 categorías, 3 productos, 5 variantes con su inventario, 2 clientes y 2 órdenes.

Se puede ejecutar varias veces sin duplicar datos. No contiene secretos reales.

### Usuarios de demostración

| Email | Contraseña | Rol |
|---|---|---|
| `admin@stride.com` | `Password123` | `admin` |
| `sales@stride.com` | `Password123` | `sales` |
| `user@stride.com` | `Password123` | `user` |

## Ejecución

```bash
npm run dev
```

El servidor corre por defecto en `http://localhost:3000`. `npm run dev` usa recarga automática (`supervisor`); `npm start` levanta el servidor sin recarga.

## Scripts / comandos disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el servidor |
| `npm run dev` | Levanta el servidor en modo desarrollo (con `supervisor`) |
| `npm run seed` | Carga roles, permisos, usuarios de demostración y datos de ejemplo |
| `npm run lint` | Corre ESLint sobre todo el proyecto |
| `npm test` | Corre las pruebas con mocks (no necesitan bases de datos) |
| `npm run test:e2e` | Corre las pruebas E2E contra la API en ejecución y con bases de datos reales |

## Estructura general del proyecto

```text
stride-co/
|-- bin/
|   `-- www
|-- config/                 # configuración por entorno y plantillas de secretos
|-- controllers/            # lógica de cada recurso
|-- locales/                # traducciones: en.json y es.json
|-- middlewares/            # authenticate, authorize, ownership y manejo de errores
|-- models/
|   |-- relationals/        # modelos de Sequelize (PostgreSQL)
|   `-- documents/          # modelos de Mongoose (MongoDB)
|-- public/
|-- rbac/                   # carga de permisos desde la base de datos (accesscontrol)
|-- routes/                 # definición de endpoints
|-- scripts/                # seed
|-- test/                   # pruebas con mocks (Jest + Supertest)
|   `-- e2e/                # pruebas end-to-end
|-- utils/
|-- views/
|-- app.js
|-- Dockerfile
|-- package.json
|-- eslint.config.js
`-- README.md
```

## Respuestas de la API y códigos HTTP

Todas las respuestas tienen el formato `{ "message": "...", "data": ... }`. El `message` va traducido según el idioma de la petición. Las respuestas nunca incluyen la contraseña ni el `salt_key` de los usuarios.

| Situación | Código |
|---|---|
| Consulta o actualización correcta | `200` |
| Creación correcta | `201` |
| Datos inválidos, id mal formado o campo único repetido | `400` |
| Sin token o token inválido / expirado | `401` |
| Usuario autenticado sin el permiso requerido, o recurso `own` de otro usuario | `403` |
| Recurso o ruta inexistente | `404` |
| Error inesperado del servidor | `500` |

Todos los recursos están montados bajo el prefijo `/api/v1/`.

## Endpoints

Cada petición sigue el flujo `i18n → authenticate (JWT) → authorize (RBAC) → controller → modelo`.

### Rutas sin permiso RBAC

| Endpoint | Protección | Descripción |
|---|---|---|
| `GET /` | Ninguna | Página de inicio |
| `GET /health` | Ninguna | Estado del servicio (`{"status":"UP"}`) |
| `POST /api/v1/auth/login` | Ninguna | Inicio de sesión; devuelve el token JWT |
| `GET /api/v1/auth/me` | Solo `authenticate` | Datos del usuario autenticado, con su rol |

### Rutas protegidas con `authenticate` y `authorize`

| Endpoint | Permiso RBAC requerido | Descripción |
|---|---|---|
| `GET /api/v1/users` | `users:read:any` | Lista usuarios |
| `GET /api/v1/users/:id` | `users:read:any` | Consulta un usuario por id |
| `POST /api/v1/users` | `users:create:any` | Crea un usuario |
| `PUT /api/v1/users/:id` | `users:update:any` | Actualiza un usuario |
| `DELETE /api/v1/users/:id` | `users:delete:any` | Elimina un usuario |
| `GET /api/v1/products` | `products:read:any` | Lista productos |
| `GET /api/v1/products/:id` | `products:read:any` | Consulta un producto por id |
| `POST /api/v1/products` | `products:create:any` | Crea un producto |
| `PUT /api/v1/products/:id` | `products:update:any` | Actualiza un producto |
| `DELETE /api/v1/products/:id` | `products:delete:any` | Elimina un producto |
| `GET /api/v1/inventory` | `inventory:read:any` | Lista registros de inventario |
| `GET /api/v1/inventory/:id` | `inventory:read:any` | Consulta un registro de inventario por id |
| `POST /api/v1/inventory` | `inventory:create:any` | Crea un registro de inventario |
| `PUT /api/v1/inventory/:id` | `inventory:update:any` | Actualiza un registro de inventario |
| `DELETE /api/v1/inventory/:id` | `inventory:delete:any` | Elimina un registro de inventario |
| `GET /api/v1/permissions` | `permissions:read:any` | Lista permisos |
| `GET /api/v1/permissions/:id` | `permissions:read:any` | Consulta un permiso por id |
| `POST /api/v1/permissions` | `permissions:create:any` | Crea un permiso |
| `PUT /api/v1/permissions/:id` | `permissions:update:any` | Actualiza un permiso |
| `DELETE /api/v1/permissions/:id` | `permissions:delete:any` | Elimina un permiso |
| `GET /api/v1/roles` | `roles:read:any` | Lista roles |
| `GET /api/v1/roles/:id` | `roles:read:any` | Consulta un rol por id |
| `POST /api/v1/roles` | `roles:create:any` | Crea un rol |
| `PUT /api/v1/roles/:id` | `roles:update:any` | Actualiza un rol |
| `DELETE /api/v1/roles/:id` | `roles:delete:any` | Elimina un rol |
| `GET /api/v1/rolePermissions` | `rolePermissions:read:any` | Lista todas las asignaciones rol-permiso |
| `GET /api/v1/rolePermissions/:roleId` | `rolePermissions:read:any` | Permisos de un rol |
| `POST /api/v1/rolePermissions` | `rolePermissions:create:any` | Asigna un permiso a un rol |
| `DELETE /api/v1/rolePermissions/:roleId/:permissionId` | `rolePermissions:delete:any` | Quita un permiso de un rol |
| `GET /api/v1/customers` | `customers:read:any` | Lista clientes |
| `GET /api/v1/customers/:id` | `customers:read:any` | Consulta un cliente por id |
| `POST /api/v1/customers` | `customers:create:any` | Crea un cliente |
| `PUT /api/v1/customers/:id` | `customers:update:any` | Actualiza un cliente |
| `DELETE /api/v1/customers/:id` | `customers:delete:any` | Elimina un cliente |
| `GET /api/v1/orders` | `orders:read:any` | Lista todas las órdenes |
| `GET /api/v1/orders/:id` | `orders:read:own` | Consulta una orden por id (propia, o cualquiera si el rol tiene `orders:read:any`) |
| `POST /api/v1/orders` | `orders:create:any` | Crea una orden |
| `PUT /api/v1/orders/:id` | `orders:update:own` | Actualiza una orden (propia, o cualquiera si el rol tiene `orders:update:any`) |
| `DELETE /api/v1/orders/:id` | `orders:delete:any` | Elimina una orden |


## Control de acceso basado en roles

La autenticación (JWT) identifica al usuario y el middleware `authorize` decide, con los permisos de su rol, si puede ejecutar la operación. Si el usuario no está autenticado la API responde `401`, y si está autenticado pero no tiene el permiso responde `403`.

```text
User -> Role -> Role_Permission -> Permission -> accesscontrol -> authenticate -> authorize -> Endpoint
```

### Roles utilizados

| Rol | Descripción |
|---|---|
| `admin` | Administrador: gestiona todo el sistema. |
| `sales` | Ventas: atiende clientes y órdenes, y consulta productos e inventario. |
| `user` | Usuario: consulta productos y gestiona sus propias órdenes. |

### Convención utilizada para `Permission.key`

Cada permiso se guarda en `Permission.key` con el formato `recurso:acción:alcance`. El modelo valida este formato con una expresión regular, por lo que no se puede registrar una key mal formada.

```text
orders:read:own
  |     |    |
  |     |    +-- alcance: own (solo recursos propios) | any (cualquier recurso)
  |     +------- acción: create | read | update | delete
  +------------- recurso: users | roles | permissions | rolePermissions | products |
                          variants | inventory | customers | orders
```

### Permisos definidos

Todos los recursos y acciones tienen su permiso registrado en la base de datos.

| Key | Descripción |
|---|---|
| `users:create:any` | Crear usuarios |
| `users:read:any` | Consultar cualquier usuario |
| `users:update:any` | Actualizar cualquier usuario |
| `users:delete:any` | Eliminar cualquier usuario |
| `roles:create:any` | Crear roles |
| `roles:read:any` | Consultar cualquier rol |
| `roles:update:any` | Actualizar cualquier rol |
| `roles:delete:any` | Eliminar cualquier rol |
| `permissions:create:any` | Crear permisos |
| `permissions:read:any` | Consultar cualquier permiso |
| `permissions:update:any` | Actualizar cualquier permiso |
| `permissions:delete:any` | Eliminar cualquier permiso |
| `rolePermissions:create:any` | Crear asignaciones rol-permiso |
| `rolePermissions:read:any` | Consultar cualquier asignación rol-permiso |
| `rolePermissions:delete:any` | Eliminar cualquier asignación rol-permiso |
| `products:create:any` | Crear productos |
| `products:read:any` | Consultar cualquier producto |
| `products:update:any` | Actualizar cualquier producto |
| `products:delete:any` | Eliminar cualquier producto |
| `inventory:create:any` | Crear registros de inventario |
| `inventory:read:any` | Consultar cualquier registro de inventario |
| `inventory:update:any` | Actualizar cualquier registro de inventario |
| `inventory:delete:any` | Eliminar cualquier registro de inventario |
| `customers:create:any` | Crear clientes |
| `customers:read:any` | Consultar cualquier cliente |
| `customers:update:any` | Actualizar cualquier cliente |
| `customers:delete:any` | Eliminar cualquier cliente |
| `orders:create:any` | Crear órdenes |
| `orders:read:own` | Consultar órdenes propias |
| `orders:read:any` | Consultar cualquier orden |
| `orders:update:own` | Actualizar órdenes propias |
| `orders:update:any` | Actualizar cualquier orden |
| `orders:delete:any` | Eliminar cualquier orden |

### Matriz RBAC

| Recurso / operación | ADMIN | SALES | USER |
|---|:---:|:---:|:---:|
| users:create:any | ✓ | × | × |
| users:read:any | ✓ | × | × |
| users:update:any | ✓ | × | × |
| users:delete:any | ✓ | × | × |
| roles:create:any | ✓ | × | × |
| roles:read:any | ✓ | × | × |
| roles:update:any | ✓ | × | × |
| roles:delete:any | ✓ | × | × |
| permissions:create:any | ✓ | × | × |
| permissions:read:any | ✓ | × | × |
| permissions:update:any | ✓ | × | × |
| permissions:delete:any | ✓ | × | × |
| rolePermissions:create:any | ✓ | × | × |
| rolePermissions:read:any | ✓ | × | × |
| rolePermissions:delete:any | ✓ | × | × |
| products:create:any | ✓ | × | × |
| products:read:any | ✓ | ✓ | ✓ |
| products:update:any | ✓ | × | × |
| products:delete:any | ✓ | × | × |
| variants:create:any | ✓ | × | × |
| variants:read:any | ✓ | ✓ | ✓ |
| variants:update:any | ✓ | × | × |
| variants:delete:any | ✓ | × | × |
| inventory:create:any | ✓ | × | × |
| inventory:read:any | ✓ | ✓ | × |
| inventory:update:any | ✓ | × | × |
| inventory:delete:any | ✓ | × | × |
| customers:create:any | ✓ | ✓ | × |
| customers:read:any | ✓ | ✓ | × |
| customers:update:any | ✓ | ✓ | × |
| customers:delete:any | ✓ | × | × |
| orders:create:any | ✓ | ✓ | ✓ |
| orders:read:own | ✓ | ✓ | ✓ |
| orders:read:any | ✓ | ✓ | × |
| orders:update:own | ✓ | ✓ | ✓ |
| orders:update:any | ✓ | ✓ | × |
| orders:delete:any | ✓ | × | × |

Esta matriz coincide con los datos del seed (`scripts/seed.js`), con las tablas `roles`, `permissions` y `role_permissions` y con el comportamiento de la API, que se verifica en las pruebas de RBAC.

### Ejemplo de permiso `own`

`orders:read:own` permite consultar solo las órdenes del propio usuario. El middleware compara el dueño real de la orden (`salesPersonId`, guardado en MongoDB) con el id del usuario autenticado (`req.user.id`), sin usar datos enviados por el cliente. Si no coinciden, responde `403`. Los roles que además tienen `orders:read:any` pasan sin esa comparación.

```javascript
router.get('/:id', authenticate, authorize('orders', 'read', 'own', orderOwnerId), ordersController.find);
```

### Ejemplo de permiso `any`

`products:delete:any` permite eliminar cualquier producto. El rol `admin` lo tiene; `sales` y `user` no, por lo que reciben `403`.

```javascript
router.delete('/:id', authenticate, authorize('products', 'delete', 'any'), productController.destroy);
```

### Cómo se obtienen los permisos desde la base de datos

Los permisos no están escritos en el código: no hay arreglos de permisos ni validaciones por nombre de rol. La única fuente de verdad son las tablas `roles`, `permissions` y `role_permissions`. Al iniciar el servidor, `bin/www` llama a `loadAccessControl()` (`rbac/accessControl.js`), que:

1. Consulta los roles con sus permisos (`Role -> role_permissions -> Permission`) usando Sequelize.
2. Separa cada `Permission.key` en `resource`, `action` y `possession`.
3. Construye los grants de la librería `accesscontrol` y los guarda en memoria.

En cada petición, `authorize(resource, action, possession)` toma el rol del usuario autenticado (`req.user.role_id`), consulta esos grants y permite o deniega el acceso. Para el alcance `own`, el middleware obtiene el dueño del recurso con `middlewares/ownership.js`. Como los permisos se cargan al arrancar, si se modifican roles o permisos hay que reiniciar el servidor.

## Internacionalización

La API responde en **español (`es`)** e **inglés (`en`)** con la librería `i18n`. Los textos están en `locales/es.json` y `locales/en.json`, con las claves organizadas por recurso, y los controllers los usan con `req.__('clave')`; no hay textos escritos en el código.

```json
{ "products": { "list": "Productos obtenidos", "notFound": "Producto no encontrado" } }
```

### Cómo elegir el idioma

El idioma se detecta en este orden:

```text
?lang=es  ->  header Accept-Language  ->  idioma por defecto (en)
```

- Un idioma no soportado (por ejemplo `fr`) responde en el idioma por defecto.
- Las variantes regionales se resuelven al idioma base (`es-MX` responde en `es`).
- Se traducen todos los `message` de la API, incluidos los errores `401`, `403`, `404` y `400`, y las vistas Pug.
- El texto de cada campo dentro de `data` en los errores de validación lo genera la librería de base de datos y puede salir en inglés.

```bash
curl -H "Accept-Language: es" -H "Authorization: Bearer <token>" http://localhost:3000/api/v1/products/999999
# { "message": "Producto no encontrado" }

curl -H "Authorization: Bearer <token>" "http://localhost:3000/api/v1/products/999999?lang=en"
# { "message": "Product not found" }
```


## Configuración y secretos

La configuración se lee con la librería `config`; el código no lee `process.env` directamente, todo se obtiene con `config.get('clave')`.

| ¿Dónde? | ¿Qué? |
|---|---|
| Variables de entorno | Solo el modo (`NODE_ENV`) y el puerto (`PORT`) |
| Archivos de `config/` en git | Configuración que no es secreta (hosts, expiración del JWT, costo de bcrypt, etc.) |
| Archivos de `config/` fuera de git | Secretos: `jwt.secret`, contraseñas y URIs de las bases de datos |

```text
config/
|-- default.json                      # valores por defecto, sin secretos
|-- production.json                   # configuración no secreta de producción
|-- test.json                         # valores para las pruebas (sin secretos reales)
|-- custom-environment-variables.json # PORT -> server.port
|-- local-development.example.json    # plantilla de secretos de desarrollo (sí va en git)
|-- local-production.example.json     # plantilla de secretos de producción (sí va en git)
|-- local-development.json            # secretos de desarrollo (NO va en git)
`-- local-production.json             # secretos de producción (NO va en git)
```

- Los entornos disponibles son `development` (por defecto), `test` y `production`, y se eligen con `NODE_ENV`.
- `PORT` se enlaza con `server.port` mediante `custom-environment-variables.json`; por defecto es `3000`.
- Los secretos (`jwt.secret`, `sql.password` o `sql.uri`, y `mongo.uri` en producción) viven solo en `config/local-*.json`, que `.gitignore` y `.dockerignore` excluyen (las plantillas `*.example.json` sí se suben).
- Si falta `jwt.secret`, el servidor no arranca y muestra un mensaje claro.
- `npm test` funciona sin secretos reales ni archivos locales gracias a `config/test.json`, que usa un costo de bcrypt bajo.


```powershell
$env:NODE_ENV="production"; $env:PORT="8080"; npm start  
```

## Pruebas

### Pruebas con mocks

No necesitan PostgreSQL ni MongoDB: los modelos se simulan con `jest.mock`.

```bash
npm test
```

Cubren el RBAC de todas las rutas (acceso permitido, acceso denegado, `own`, `any` y respuestas `401` / `403`) y la internacionalización (detección del idioma, claves iguales en `en.json` y `es.json` y vistas Pug). Para ver el detalle de cada prueba:

```bash
npx jest --verbose
```

### Pruebas E2E

Se ejecutan con Jest y Supertest **sin mocks**, contra la API en ejecución y con bases de datos reales. Viven en `test/e2e/` y se ejecutan sin depender de Antigravity.

```bash
# Local: la API debe estar corriendo (npm run dev) y las bases de datos con el seed cargado
npm run test:e2e
```

La URL de la API se lee de la configuración (`e2e.baseUrl`, por defecto `http://localhost:3000`). Para correr la misma suite contra el despliegue en Render:

```bash
E2E_BASE_URL=https://stride-co-api.onrender.com npm run test:e2e
```

```powershell
$env:E2E_BASE_URL="https://stride-co-api.onrender.com"; npm run test:e2e   # Windows (PowerShell)
```

Antes de correrlas contra Render conviene consultar `GET /health`, porque el servicio gratuito se apaga cuando no recibe tráfico y tarda alrededor de un minuto en volver a responder.

Resultado de `npm run test:e2e` contra Render:

![npm run test:e2e contra Render](docs/img/e2e-render.jpeg)



## Análisis de calidad de código

El proyecto usa ESLint (`eslint.config.js`) con la configuración recomendada de `@eslint/js`, adaptada para Node.js (CommonJS) y para los archivos de prueba de Jest.

```bash
npm run lint
```

## API pública

| Dato | Contenido |
|---|---|
| **URL pública** | https://stride-co-api.onrender.com (Web Service gratuito de Render con Docker, región Oregon, desplegado desde la rama `staging`) |
| **Health Check** | `GET /health` (configurado como Health Check Path en Render) |
| **Usuarios de demostración** | `admin@stride.com`, `sales@stride.com` y `user@stride.com`, todos con la contraseña `Password123` (ver *Usuarios de demostración*) |
| **Render PostgreSQL** | Creada el 2 de noviembre de 2026 (vence el 2 de diciembre de 2026), región Oregon (`us-west-2`). El plan gratuito caduca 30 días después de crearse |
| **MongoDB Atlas** | Cluster `stride-co` (plan gratuito M0), proveedor AWS, región Oregon (`us-west-2`). Usuario de base de datos exclusivo del proyecto, con permisos de lectura y escritura.
| **Secretos** | `config/local-production.json` no está en el repositorio ni en la imagen (lo excluyen `.gitignore` y `.dockerignore`). En Render se carga como *Secret File* con el nombre `local-production.json`; Render lo monta en `/etc/secrets/local-production.json` y el `Dockerfile` crea un enlace a `config/local-production.json` antes de ejecutar `npm start`. `NODE_ENV=production` se define en el `Dockerfile` y `PORT` lo asigna Render; no hay otras variables de entorno |


### Ejemplo de uso

1. Verificar que el servicio esté activo:

```bash
curl https://stride-co-api.onrender.com/health
```

2. Iniciar sesión con un usuario de demostración y copiar el `token` de la respuesta:

```bash
curl -X POST https://stride-co-api.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@stride.com","password":"Password123"}'
```

3. Consultar un recurso permitido, en español:

```bash
curl -H "Authorization: Bearer <token>" -H "Accept-Language: es" \
  https://stride-co-api.onrender.com/api/v1/products
```

4. Probar un recurso denegado: con el token de `user@stride.com`, `GET /api/v1/users` responde `403`, y con `?lang=en` el mensaje sale en inglés:

```bash
curl -H "Authorization: Bearer <token_de_user>" "https://stride-co-api.onrender.com/api/v1/users?lang=en"
# { "message": "Forbidden" }
```

## Control de versiones

La rama de entrega es `staging`, creada a partir de `master`, y Render despliega desde ella. Cada bloque del entregable se desarrolló en su propia rama y se integró a `staging` conservando las ramas en el remoto:

| Rama | Contenido |
|---|---|
| `feat/config` | Configuración por entornos y secretos |
| `feat/orm-odm-routes` | Rutas funcionales con Sequelize y Mongoose, y `npm run seed` |
| `feat/route-protection` | `authenticate` y `authorize` en todas las rutas |
| `feat/i18n` | Internacionalización |
| `chore/render-deploy` | Despliegue en Render + PostgreSQL + Atlas |
| `test/e2e` | Pruebas E2E con Jest y Supertest |

## Autoras

Isabela Jazmín Solís Castillo — 376827
Janely Monreal Torres — 377112