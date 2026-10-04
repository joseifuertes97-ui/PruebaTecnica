using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using PruebaTecnica.Data;
using PruebaTecnica.Models;
using PruebaTecnica.Services;

namespace PruebaTecnica.Controllers;

[ApiController]
[Authorize]
[Route("api/compras")]
public class ComprasController : ControllerBase
{
    private readonly AppDbContext db;
    private readonly OperacionesService operaciones;

    public ComprasController(AppDbContext db, OperacionesService operaciones)
    {
        this.db = db;
        this.operaciones = operaciones;
    }

    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var registros = await db.Compras.AsNoTracking()
            .Include(x => x.Detalles)
            .OrderByDescending(x => x.Id)
            .ToListAsync();

        // Buscamos los nombres de los productos para mostrarlos en el historial.
        var productos = await db.Productos.AsNoTracking()
            .ToDictionaryAsync(x => x.Id, x => x.Nombre);

        var resultado = registros.Select(x => new
        {
            x.Id,
            x.Fecha,
            x.SubTotal,
            x.Igv,
            x.Total,
            Detalles = x.Detalles.Select(d => new
            {
                d.Id,
                d.ProductoId,
                NombreProducto = productos.TryGetValue(d.ProductoId, out var nombre)
                    ? nombre
                    : "Producto no encontrado",
                d.Cantidad,
                d.Precio,
                d.SubTotal,
                d.Igv,
                d.Total
            })
        });

        return Ok(resultado);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar(CompraRequest request)
    {
        if (request.Detalles.Any(x => x is null))
            return BadRequest(new { mensaje = "El detalle contiene una fila vacía." });

        try
        {
            var registro = await operaciones.RegistrarCompra(request);
            return StatusCode(201, registro);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { mensaje = ex.Message });
        }
        // Si dos operaciones compiten por el stock, SQL puede cancelar una.
        catch (DbUpdateException ex) when (ex.InnerException is SqlException sql && sql.Number == 1205)
        {
            return Conflict(new { mensaje = "Otra operación se está guardando. Actualiza el stock y vuelve a intentar." });
        }
        catch (SqlException ex) when (ex.Number == 1205)
        {
            return Conflict(new { mensaje = "Otra operación se está guardando. Actualiza el stock y vuelve a intentar." });
        }
    }
}
