using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PruebaTecnica.Models;

[Table("VentaCab")]
public class VentaCab
{
    [Key, Column("Id_VentaCab")]
    public int Id { get; set; }
    [Column("FecRegistro")]
    public DateTime Fecha { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Igv { get; set; }
    public decimal Total { get; set; }
    public List<VentaDet> Detalles { get; set; } = new();
}
[Table("VentaDet")]
public class VentaDet
{
    [Key, Column("Id_VentaDet")]
    public int Id { get; set; }
    [Column("Id_VentaCab")]
    public int VentaId { get; set; }
    [Column("Id_producto")]
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal Precio { get; set; }
    [Column("Sub_Total")]
    public decimal SubTotal { get; set; }
    public decimal Igv { get; set; }
    public decimal Total { get; set; }
}
