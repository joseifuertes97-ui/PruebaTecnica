# PruebaTecnica - un proyecto

1. Ejecuta completo `BaseDatos_PruebaTecnica.sql` en SSMS (entregado aparte).
   Si ya tienes las siete tablas, igualmente ejecútalo: actualiza los procedimientos de Productos.
2. Abre `PruebaTecnica.sln` en Visual Studio 2022 con la carga ASP.NET/desarrollo web y SDK .NET 8.
3. En `appsettings.json` configura el MISMO servidor SQL que usaste en SSMS.
4. Espera la restauración de NuGet y presiona F5.
5. La interfaz abre en http://localhost:5080. Ingresa `admin` / `123456`.
6. Swagger: http://localhost:5080/swagger.

## Estructura sencilla

- Controllers: endpoints de login, productos, compras, ventas y Kardex.
- Models: tablas y solicitudes recibidas en JSON.
- Data/AppDbContext.cs: conexión y mapeo de tablas con Entity Framework Core.
- Services: registro de operaciones y cálculos.
- Frontend: código fuente React + Bootstrap.
- wwwroot: frontend compilado, listo para F5 sin iniciar Node.

SQL, Postman, pruebas y guía se entregan por separado.
Productos usa procedimientos almacenados; compras, ventas y Kardex usan Entity Framework.
Se mantienen las siete tablas del examen. No hay Docker ni proyecto de pruebas en la solución.


## Regla de compra y venta aplicada

- Compra: guarda CompraCab y CompraDet, no calcula IGV (`Igv = 0`) y `Total = SubTotal`.
- Al comprar, el producto toma el nuevo costo y `PrecioVenta = Costo * 1.35`.
- La compra genera un movimiento tipo 1 (Entrada), que incrementa el stock del Kardex.
- Venta: usa el PrecioVenta vigente, valida el stock y calcula IGV con el factor configurado (0.18).
- La venta genera un movimiento tipo 2 (Salida).

## Si modificas React

Abre una terminal en Frontend (puedes editar esa carpeta en VS Code):

```powershell
npm.cmd ci
npm.cmd run build
```

El build actualiza ../wwwroot. Luego ejecuta otra vez con F5.
Opcional: npm.cmd run dev sirve React en http://localhost:5173 con recarga automática;
la API debe seguir abierta en http://localhost:5080. CORS solo permite ese origen externo.
En la ejecución normal frontend y API comparten origen y el navegador no necesita CORS.

## Acceso y alcance

admin/123456 es el login de la interfaz, no un usuario de SQL Server.
La cuenta se valida en AuthController con la configuración Demo de appsettings.json.
El token dura 30 minutos y se guarda en memoria; al recargar se vuelve a iniciar sesión.
La cuenta y clave JWT incluidas son de demostración local, no credenciales de producción.
La publicación .NET incluye wwwroot; después de cambios React hay que reconstruirlo antes.

Revisa la guía y ejecuta las pruebas externas en tu PC antes de grabar el video.
