using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PruebaTecnica.Models;

[Table("CompraCab")]
public class CompraCab
{
    [Key, Column("Id_CompraCab")]
    public int Id { get; set; }
    [Column("FecRegistro")]
    public DateTime Fecha { get; set; }
    public decimal SubTotal { get; set; }
    public decimal Igv { get; set; }
    public decimal Total { get; set; }
    public List<CompraDet> Detalles { get; set; } = new();
}
[Table("CompraDet")]
public class CompraDet
{
    [Key, Column("Id_CompraDet")]
    public int Id { get; set; }
    [Column("Id_CompraCab")]
    public int CompraId { get; set; }
    [Column("Id_producto")]
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal Precio { get; set; }
    [Column("Sub_Total")]
    public decimal SubTotal { get; set; }
    public decimal Igv { get; set; }
    public decimal Total { get; set; }
}
