# PruebaTecnica

Sistema básico de compras, ventas y control de stock desarrollado con .NET 8, React y SQL Server.

## Requisitos

- Visual Studio 2022
- .NET 8 SDK
- SQL Server
- SQL Server Management Studio (SSMS)

## Pasos para ejecutar

### 1. Crear la base de datos

Abrir SQL Server Management Studio y ejecutar completamente:

`BaseDatos_PruebaTecnica.sql`

El script crea la base de datos `PruebaTecnica`, sus tablas y procedimientos almacenados.

### 2. Configurar la conexión

Abrir:

`PruebaTecnica.sln`

Luego editar:

`appsettings.json`

Cambiar el servidor de la cadena de conexión por el servidor SQL utilizado en SSMS.

Ejemplo:

```json
"DefaultConnection": "Server=TU_SERVIDOR;Database=PruebaTecnica;Trusted_Connection=True;Encrypt=True;TrustServerCertificate=True"
```

### 3. Ejecutar el proyecto

Esperar que Visual Studio restaure los paquetes NuGet y presionar:

`F5`

La aplicación se abrirá en:

`http://localhost:5080`

## Credenciales

Usuario:

`admin`

Contraseña:

`123456`

Estas credenciales corresponden únicamente al login de la aplicación y no a SQL Server.

## Swagger

La documentación y prueba de la API está disponible en:

`http://localhost:5080/swagger`

## Funciones principales

- Registro de productos.
- Registro de compras.
- Registro de ventas.
- Control de stock mediante movimientos.
- Kardex.
- Historial de compras y ventas.
- Autenticación mediante JWT.

## Consideraciones

- El token de sesión tiene una duración de 30 minutos.
- Las compras generan movimientos de entrada.
- Las ventas generan movimientos de salida.
- El precio de venta se calcula como:

`PrecioVenta = Costo × 1.35`

- El IGV de las ventas utiliza un factor de `0.18`.

## Si se modifica el frontend React

Abrir una terminal dentro de la carpeta `Frontend` y ejecutar:

```bash
npm.cmd ci
npm.cmd run build
```

Luego volver a ejecutar el proyecto con `F5`.
