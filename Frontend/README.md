# Código fuente React

Esta carpeta forma parte del único proyecto PruebaTecnica.
La aplicación se abre con F5 desde Visual Studio: el frontend compilado está en wwwroot.
Para editar React puedes usar Visual Studio o abrir esta carpeta en VS Code.

Después de editar, desde ESTA carpeta:

npm.cmd ci
npm.cmd run build

La compilación actualiza ../wwwroot; ejecuta de nuevo con F5.
Node se necesita para recompilar, no para abrir la versión ya compilada.

Opcional: npm.cmd run dev (http://localhost:5173) para recarga automática.
Con ese modo la API debe estar abierta en http://localhost:5080.
En src/api.js se decide la URL: desarrollo usa localhost:5080/api;
la versión compilada usa /api en el mismo servidor donde esté publicada.

El login de la interfaz es admin / 123456; el backend valida esa cuenta.
El frontend nunca se conecta directamente a SQL Server.
