

USE master;
GO

IF DB_ID('PruebaTecnica') IS NULL
BEGIN
    CREATE DATABASE PruebaTecnica;
    PRINT 'Base de datos PruebaTecnica creada correctamente.';
END
ELSE
BEGIN
    PRINT 'La base de datos PruebaTecnica ya existe.';
END
GO

USE PruebaTecnica;
GO

/* 1. PRODUCTOS */
IF OBJECT_ID('dbo.Productos', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.Productos
    (
        Id_producto INT IDENTITY(1,1) NOT NULL,
        Nombre_producto VARCHAR(100) NOT NULL,
        NroLote VARCHAR(50) NOT NULL,
        Fec_registro DATETIME NOT NULL CONSTRAINT DF_Productos_FecRegistro DEFAULT GETDATE(),
        Costo DECIMAL(18,2) NOT NULL CONSTRAINT DF_Productos_Costo DEFAULT 0,
        PrecioVenta DECIMAL(18,2) NOT NULL CONSTRAINT DF_Productos_PrecioVenta DEFAULT 0,
        CONSTRAINT PK_Productos PRIMARY KEY (Id_producto),
        CONSTRAINT CK_Productos_Costo CHECK (Costo >= 0),
        CONSTRAINT CK_Productos_PrecioVenta CHECK (PrecioVenta >= 0)
    );
    PRINT 'Tabla Productos creada.';
END
ELSE PRINT 'Tabla Productos ya existe.';
GO

/* 2. COMPRA CABECERA */
IF OBJECT_ID('dbo.CompraCab', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CompraCab
    (
        Id_CompraCab INT IDENTITY(1,1) NOT NULL,
        FecRegistro DATETIME NOT NULL CONSTRAINT DF_CompraCab_FecRegistro DEFAULT GETDATE(),
        SubTotal DECIMAL(18,2) NOT NULL,
        Igv DECIMAL(18,2) NOT NULL,
        Total DECIMAL(18,2) NOT NULL,
        CONSTRAINT PK_CompraCab PRIMARY KEY (Id_CompraCab),
        CONSTRAINT CK_CompraCab_SubTotal CHECK (SubTotal >= 0),
        CONSTRAINT CK_CompraCab_Igv CHECK (Igv >= 0),
        CONSTRAINT CK_CompraCab_Total CHECK (Total >= 0)
    );
    PRINT 'Tabla CompraCab creada.';
END
ELSE PRINT 'Tabla CompraCab ya existe.';
GO

/* 3. COMPRA DETALLE */
IF OBJECT_ID('dbo.CompraDet', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.CompraDet
    (
        Id_CompraDet INT IDENTITY(1,1) NOT NULL,
        Id_CompraCab INT NOT NULL,
        Id_producto INT NOT NULL,
        Cantidad INT NOT NULL,
        Precio DECIMAL(18,2) NOT NULL,
        Sub_Total DECIMAL(18,2) NOT NULL,
        Igv DECIMAL(18,2) NOT NULL,
        Total DECIMAL(18,2) NOT NULL,
        CONSTRAINT PK_CompraDet PRIMARY KEY (Id_CompraDet),
        CONSTRAINT FK_CompraDet_CompraCab FOREIGN KEY (Id_CompraCab) REFERENCES dbo.CompraCab(Id_CompraCab),
        CONSTRAINT FK_CompraDet_Productos FOREIGN KEY (Id_producto) REFERENCES dbo.Productos(Id_producto),
        CONSTRAINT CK_CompraDet_Cantidad CHECK (Cantidad > 0),
        CONSTRAINT CK_CompraDet_Precio CHECK (Precio >= 0)
    );
    PRINT 'Tabla CompraDet creada.';
END
ELSE PRINT 'Tabla CompraDet ya existe.';
GO

/* 4. VENTA CABECERA */
IF OBJECT_ID('dbo.VentaCab', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VentaCab
    (
        Id_VentaCab INT IDENTITY(1,1) NOT NULL,
        FecRegistro DATETIME NOT NULL CONSTRAINT DF_VentaCab_FecRegistro DEFAULT GETDATE(),
        SubTotal DECIMAL(18,2) NOT NULL,
        Igv DECIMAL(18,2) NOT NULL,
        Total DECIMAL(18,2) NOT NULL,
        CONSTRAINT PK_VentaCab PRIMARY KEY (Id_VentaCab),
        CONSTRAINT CK_VentaCab_SubTotal CHECK (SubTotal >= 0),
        CONSTRAINT CK_VentaCab_Igv CHECK (Igv >= 0),
        CONSTRAINT CK_VentaCab_Total CHECK (Total >= 0)
    );
    PRINT 'Tabla VentaCab creada.';
END
ELSE PRINT 'Tabla VentaCab ya existe.';
GO

/* 5. VENTA DETALLE */
IF OBJECT_ID('dbo.VentaDet', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.VentaDet
    (
        Id_VentaDet INT IDENTITY(1,1) NOT NULL,
        Id_VentaCab INT NOT NULL,
        Id_producto INT NOT NULL,
        Cantidad INT NOT NULL,
        Precio DECIMAL(18,2) NOT NULL,
        Sub_Total DECIMAL(18,2) NOT NULL,
        Igv DECIMAL(18,2) NOT NULL,
        Total DECIMAL(18,2) NOT NULL,
        CONSTRAINT PK_VentaDet PRIMARY KEY (Id_VentaDet),
        CONSTRAINT FK_VentaDet_VentaCab FOREIGN KEY (Id_VentaCab) REFERENCES dbo.VentaCab(Id_VentaCab),
        CONSTRAINT FK_VentaDet_Productos FOREIGN KEY (Id_producto) REFERENCES dbo.Productos(Id_producto),
        CONSTRAINT CK_VentaDet_Cantidad CHECK (Cantidad > 0),
        CONSTRAINT CK_VentaDet_Precio CHECK (Precio >= 0)
    );
    PRINT 'Tabla VentaDet creada.';
END
ELSE PRINT 'Tabla VentaDet ya existe.';
GO

/* 6. MOVIMIENTO CABECERA
   1 = Entrada / Compra
   2 = Salida / Venta */
IF OBJECT_ID('dbo.MovimientoCab', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MovimientoCab
    (
        Id_MovimientoCab INT IDENTITY(1,1) NOT NULL,
        Fec_registro DATETIME NOT NULL CONSTRAINT DF_MovimientoCab_FecRegistro DEFAULT GETDATE(),
        Id_TipoMovimiento INT NOT NULL,
        Id_DocumentoOrigen INT NOT NULL,
        CONSTRAINT PK_MovimientoCab PRIMARY KEY (Id_MovimientoCab),
        CONSTRAINT CK_MovimientoCab_TipoMovimiento CHECK (Id_TipoMovimiento IN (1,2))
    );
    PRINT 'Tabla MovimientoCab creada.';
END
ELSE PRINT 'Tabla MovimientoCab ya existe.';
GO

/* 7. MOVIMIENTO DETALLE */
IF OBJECT_ID('dbo.MovimientoDet', 'U') IS NULL
BEGIN
    CREATE TABLE dbo.MovimientoDet
    (
        Id_MovimientoDet INT IDENTITY(1,1) NOT NULL,
        Id_movimientocab INT NOT NULL,
        Id_Producto INT NOT NULL,
        Cantidad INT NOT NULL,
        CONSTRAINT PK_MovimientoDet PRIMARY KEY (Id_MovimientoDet),
        CONSTRAINT FK_MovimientoDet_MovimientoCab FOREIGN KEY (Id_movimientocab) REFERENCES dbo.MovimientoCab(Id_MovimientoCab),
        CONSTRAINT FK_MovimientoDet_Productos FOREIGN KEY (Id_Producto) REFERENCES dbo.Productos(Id_producto),
        CONSTRAINT CK_MovimientoDet_Cantidad CHECK (Cantidad > 0)
    );
    PRINT 'Tabla MovimientoDet creada.';
END
ELSE PRINT 'Tabla MovimientoDet ya existe.';
GO



CREATE OR ALTER PROCEDURE dbo.sp_Producto_Listar
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id_producto, Nombre_producto, NroLote, Fec_registro, Costo, PrecioVenta
    FROM dbo.Productos
    ORDER BY Id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_Producto_ObtenerPorId
    @Id_producto INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT Id_producto, Nombre_producto, NroLote, Fec_registro, Costo, PrecioVenta
    FROM dbo.Productos
    WHERE Id_producto = @Id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_Producto_Insertar
    @Nombre_producto VARCHAR(100),
    @NroLote VARCHAR(50),
    @Costo DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO dbo.Productos (Nombre_producto, NroLote, Fec_registro, Costo, PrecioVenta)
    VALUES (@Nombre_producto, @NroLote, GETDATE(), @Costo, ROUND(@Costo * 1.35, 2));

    DECLARE @NuevoId INT = CONVERT(INT, SCOPE_IDENTITY());
    SELECT Id_producto, Nombre_producto, NroLote, Fec_registro, Costo, PrecioVenta
    FROM dbo.Productos
    WHERE Id_producto = @NuevoId;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_Producto_Actualizar
    @Id_producto INT,
    @Nombre_producto VARCHAR(100),
    @NroLote VARCHAR(50),
    @Costo DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE dbo.Productos
    SET Nombre_producto = @Nombre_producto,
        NroLote = @NroLote,
        Costo = @Costo,
        PrecioVenta = ROUND(@Costo * 1.35, 2)
    WHERE Id_producto = @Id_producto;

    SELECT Id_producto, Nombre_producto, NroLote, Fec_registro, Costo, PrecioVenta
    FROM dbo.Productos
    WHERE Id_producto = @Id_producto;
END
GO

CREATE OR ALTER PROCEDURE dbo.sp_Producto_Eliminar
    @Id_producto INT
AS
BEGIN
    -- El backend usa la cantidad de filas afectadas para reconocer un ID inexistente.
    SET NOCOUNT OFF;
    DELETE FROM dbo.Productos WHERE Id_producto = @Id_producto;
    -- Las claves foráneas impiden borrar productos con operaciones registradas.
END
GO

PRINT 'Script finalizado: siete tablas y cinco procedimientos de Productos.';
GO


