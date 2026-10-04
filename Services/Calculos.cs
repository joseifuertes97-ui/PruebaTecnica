namespace PruebaTecnica.Services;
public static class Calculos
{
    public static decimal Redondear(decimal valor) =>
        Math.Round(valor, 2, MidpointRounding.AwayFromZero);
    public static decimal PrecioVenta(decimal costo) => Redondear(costo * 1.35m);
    public static (decimal SubTotal, decimal Igv, decimal Total) Linea(
        int cantidad, decimal precio, decimal factorIgv)
    {
        var subtotal = Redondear(cantidad * precio);
        var igv = Redondear(subtotal * factorIgv);
        return (subtotal, igv, subtotal + igv);
    }
}
