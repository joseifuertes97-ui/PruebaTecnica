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
[Route("api/productos")]
public class ProductosController : ControllerBase
{
    private readonly AppDbContext db;

    public ProductosController(AppDbContext db)
    {
        this.db = db;
    }

    // Ejecutamos los procedimientos que se incluyen en el archivo SQL.
    [HttpGet]
    public async Task<IActionResult> Listar()
    {
        var productos = await db.Productos
            .FromSqlInterpolated($"EXEC dbo.sp_Producto_Listar")
            .AsNoTracking().ToListAsync();

        return Ok(productos);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> Obtener(int id)
    {
        var productos = await db.Productos
            .FromSqlInterpolated($"EXEC dbo.sp_Producto_ObtenerPorId {id}")
            .AsNoTracking().ToListAsync();

        if (productos.Count == 0)
            return NotFound(new { mensaje = "Producto no encontrado." });

        return Ok(productos[0]);
    }

    [HttpPost]
    public async Task<IActionResult> Registrar(ProductoRequest request)
    {
        if (request.Costo != Calculos.Redondear(request.Costo))
            return BadRequest(new { mensaje = "El costo admite un máximo de 2 decimales." });

        var nombre = request.Nombre.Trim();
        var lote = request.NroLote.Trim();
        var productos = await db.Productos
            .FromSqlInterpolated($"EXEC dbo.sp_Producto_Insertar {nombre}, {lote}, {request.Costo}")
            .AsNoTracking().ToListAsync();

        return StatusCode(201, productos[0]);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Actualizar(int id, ProductoRequest request)
    {
        if (request.Costo != Calculos.Redondear(request.Costo))
            return BadRequest(new { mensaje = "El costo admite un máximo de 2 decimales." });

        var nombre = request.Nombre.Trim();
        var lote = request.NroLote.Trim();
        var productos = await db.Productos
            .FromSqlInterpolated($"EXEC dbo.sp_Producto_Actualizar {id}, {nombre}, {lote}, {request.Costo}")
            .AsNoTracking().ToListAsync();

        if (productos.Count == 0)
            return NotFound(new { mensaje = "Producto no encontrado." });

        return Ok(productos[0]);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Eliminar(int id)
    {
        try
        {
            var filas = await db.Database.ExecuteSqlInterpolatedAsync(
                $"EXEC dbo.sp_Producto_Eliminar {id}");

            if (filas == 0)
                return NotFound(new { mensaje = "Producto no encontrado." });

            return NoContent();
        }
        catch (SqlException ex) when (ex.Number == 547)
        {
            return Conflict(new { mensaje = "No se puede eliminar un producto con compras, ventas o movimientos." });
        }
    }
}
