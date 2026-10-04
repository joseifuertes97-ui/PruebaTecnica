using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Data;

namespace PruebaTecnica.Controllers;

[ApiController]
[Authorize]
[Route("api/kardex")]
public class KardexController : ControllerBase
{
    private readonly AppDbContext db;
    private readonly IConfiguration config;

    public KardexController(AppDbContext db, IConfiguration config)
    {
        this.db = db;
        this.config = config;
    }

    [HttpGet("configuracion")]
    public IActionResult Configuracion()
    {
        return Ok(new { factorIgv = config.GetValue<decimal>("Calculos:FactorIgv") });
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var productos = await db.Productos.AsNoTracking().OrderBy(p => p.Id)
            .Select(p => new
            {
                p.Id,
                p.Nombre,
                p.NroLote,
                p.Costo,
                p.PrecioVenta,
                // Entradas suman; salidas restan. Sin movimientos el stock es cero.
                StockActual = db.MovimientoDetalles
                    .Where(d => d.ProductoId == p.Id)
                    .Sum(d => (long?)(d.Movimiento.Tipo == 1 ? (long)d.Cantidad : -(long)d.Cantidad)) ?? 0
            }).ToListAsync();

        return Ok(productos);
    }

    [HttpGet("{id:int}/movimientos")]
    public async Task<IActionResult> Movimientos(int id)
    {
        if (!await db.Productos.AnyAsync(p => p.Id == id))
            return NotFound(new { mensaje = "Producto no encontrado." });

        var movimientos = await db.MovimientoDetalles.AsNoTracking()
            .Where(d => d.ProductoId == id)
            .OrderBy(d => d.Movimiento.Fecha).ThenBy(d => d.Id)
            .Select(d => new
            {
                d.Movimiento.Fecha,
                TipoMovimiento = d.Movimiento.Tipo == 1 ? "Entrada / compra" : "Salida / venta",
                d.Cantidad,
                d.Movimiento.DocumentoId
            }).ToListAsync();

        return Ok(movimientos);
    }
}
