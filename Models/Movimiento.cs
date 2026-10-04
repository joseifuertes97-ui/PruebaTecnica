using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace PruebaTecnica.Models;

[Table("MovimientoCab")]
public class MovimientoCab
{
    [Key, Column("Id_MovimientoCab")]
    public int Id { get; set; }
    [Column("Fec_registro")]
    public DateTime Fecha { get; set; }
    [Column("Id_TipoMovimiento")]
    public int Tipo { get; set; }
    [Column("Id_DocumentoOrigen")]
    public int DocumentoId { get; set; }
    public List<MovimientoDet> Detalles { get; set; } = new();
}
[Table("MovimientoDet")]
public class MovimientoDet
{
    [Key, Column("Id_MovimientoDet")]
    public int Id { get; set; }
    [Column("Id_movimientocab")]
    public int MovimientoId { get; set; }
    [Column("Id_Producto")]
    public int ProductoId { get; set; }
    public int Cantidad { get; set; }
    public MovimientoCab Movimiento { get; set; } = null!;
}
