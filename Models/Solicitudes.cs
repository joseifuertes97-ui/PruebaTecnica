using System.ComponentModel.DataAnnotations;

namespace PruebaTecnica.Models;

public class LoginRequest
{
    [Required]
    public string Usuario { get; set; } = "";
    [Required]
    public string Password { get; set; } = "";
}
public class ProductoRequest
{
    [Required, StringLength(100)]
    public string Nombre { get; set; } = "";
    [Required, StringLength(50)]
    public string NroLote { get; set; } = "";
    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal Costo { get; set; }
}
public class CompraRequest
{
    [Required, MinLength(1), MaxLength(100)]
    public List<CompraLinea> Detalles { get; set; } = new();
}
public class CompraLinea
{
    [Range(1, int.MaxValue)]
    public int ProductoId { get; set; }
    [Range(1, 1000000)]
    public int Cantidad { get; set; }
    [Range(typeof(decimal), "0.01", "1000000")]
    public decimal Precio { get; set; }
}
public class VentaRequest
{
    [Required, MinLength(1), MaxLength(100)]
    public List<VentaLinea> Detalles { get; set; } = new();
}
public class VentaLinea
{
    [Range(1, int.MaxValue)]
    public int ProductoId { get; set; }
    [Range(1, 1000000)]
    public int Cantidad { get; set; }
}
