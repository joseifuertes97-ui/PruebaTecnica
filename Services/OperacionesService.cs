using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Data;
using PruebaTecnica.Models;

namespace PruebaTecnica.Services;

public class OperacionesService
{
    private readonly AppDbContext _db;
    private readonly decimal _factorIgv;

    public OperacionesService(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _factorIgv = configuration.GetValue<decimal>("Calculos:FactorIgv");
    }

    // Stock = Entradas - Salidas.
    public async Task<long> ObtenerStock(int productoId)
    {
        return await _db.MovimientoDetalles
            .Where(x => x.ProductoId == productoId)
            .SumAsync(x => (long?)(x.Movimiento.Tipo == 1
                ? x.Cantidad
                : -x.Cantidad)) ?? 0;
    }

    public async Task<CompraCab> RegistrarCompra(CompraRequest request)
    {
        if (request.Detalles.Select(x => x.ProductoId).Distinct().Count() != request.Detalles.Count)
            throw new ArgumentException("No repitas un producto. Usa una sola fila con su cantidad total.");

        await using var transaccion = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        var compra = new CompraCab
        {
            Fecha = DateTime.Now
        };

        foreach (var item in request.Detalles)
        {
            var producto = await _db.Productos.FindAsync(item.ProductoId);

            if (producto == null)
                throw new ArgumentException($"No existe el producto {item.ProductoId}.");

            if (item.Precio != Calculos.Redondear(item.Precio))
                throw new ArgumentException("El costo admite un máximo de 2 decimales.");

            // La compra no calcula IGV. El precio ingresado es el costo unitario.
            var subtotalCompra = Calculos.Redondear(item.Cantidad * item.Precio);

            compra.Detalles.Add(new CompraDet
            {
                ProductoId = item.ProductoId,
                Cantidad = item.Cantidad,
                Precio = item.Precio,
                SubTotal = subtotalCompra,
                Igv = 0m,
                Total = subtotalCompra
            });

            // Regla solicitada por la prueba tecnica.
            producto.Costo = item.Precio;
            producto.PrecioVenta = Calculos.PrecioVenta(item.Precio);
        }

        compra.SubTotal = compra.Detalles.Sum(x => x.SubTotal);
        compra.Igv = 0m;
        compra.Total = compra.SubTotal;

        _db.Compras.Add(compra);
        await _db.SaveChangesAsync();

        var movimiento = new MovimientoCab
        {
            Fecha = compra.Fecha,
            Tipo = 1, // Entrada
            DocumentoId = compra.Id
        };

        foreach (var item in compra.Detalles)
        {
            movimiento.Detalles.Add(new MovimientoDet
            {
                ProductoId = item.ProductoId,
                Cantidad = item.Cantidad
            });
        }

        _db.Movimientos.Add(movimiento);
        await _db.SaveChangesAsync();

        await transaccion.CommitAsync();

        return compra;
    }

    public async Task<VentaCab> RegistrarVenta(VentaRequest request)
    {
        if (request.Detalles.Select(x => x.ProductoId).Distinct().Count() != request.Detalles.Count)
            throw new ArgumentException("No repitas un producto. Usa una sola fila con su cantidad total.");

        await using var transaccion = await _db.Database.BeginTransactionAsync(System.Data.IsolationLevel.Serializable);

        var venta = new VentaCab
        {
            Fecha = DateTime.Now
        };

        foreach (var item in request.Detalles)
        {
            var producto = await _db.Productos.FindAsync(item.ProductoId);

            if (producto == null)
                throw new ArgumentException($"No existe el producto {item.ProductoId}.");

            var stock = await ObtenerStock(item.ProductoId);

            if (item.Cantidad > stock)
                throw new ArgumentException(
                    $"La cantidad no debe ser mayor al stock disponible. Stock actual: {stock}.");

            var calculo = Calculos.Linea(item.Cantidad, producto.PrecioVenta, _factorIgv);

            venta.Detalles.Add(new VentaDet
            {
                ProductoId = item.ProductoId,
                Cantidad = item.Cantidad,
                Precio = producto.PrecioVenta,
                SubTotal = calculo.SubTotal,
                Igv = calculo.Igv,
                Total = calculo.Total
            });
        }

        venta.SubTotal = venta.Detalles.Sum(x => x.SubTotal);
        venta.Igv = venta.Detalles.Sum(x => x.Igv);
        venta.Total = venta.Detalles.Sum(x => x.Total);

        _db.Ventas.Add(venta);
        await _db.SaveChangesAsync();

        var movimiento = new MovimientoCab
        {
            Fecha = venta.Fecha,
            Tipo = 2, // Salida
            DocumentoId = venta.Id
        };

        foreach (var item in venta.Detalles)
        {
            movimiento.Detalles.Add(new MovimientoDet
            {
                ProductoId = item.ProductoId,
                Cantidad = item.Cantidad
            });
        }

        _db.Movimientos.Add(movimiento);
        await _db.SaveChangesAsync();

        await transaccion.CommitAsync();

        return venta;
    }
}
