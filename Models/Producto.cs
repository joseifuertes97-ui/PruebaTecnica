using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PruebaTecnica.Models;

[Table("Productos")]
public class Producto
{
    [Key, Column("Id_producto")]
    public int Id { get; set; }
    [Column("Nombre_producto"), MaxLength(100)]
    public string Nombre { get; set; } = "";
    [MaxLength(50)]
    public string NroLote { get; set; } = "";
    [Column("Fec_registro")]
    public DateTime Fecha { get; set; }
    public decimal Costo { get; set; }
    public decimal PrecioVenta { get; set; }
}
