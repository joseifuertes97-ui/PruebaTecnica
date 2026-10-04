using PruebaTecnica.Models;
using Microsoft.EntityFrameworkCore;
namespace PruebaTecnica.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<CompraCab> Compras => Set<CompraCab>();
    public DbSet<VentaCab> Ventas => Set<VentaCab>();
    public DbSet<MovimientoCab> Movimientos => Set<MovimientoCab>();
    public DbSet<MovimientoDet> MovimientoDetalles => Set<MovimientoDet>();
    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<CompraCab>().HasMany(x => x.Detalles).WithOne()
            .HasForeignKey(x => x.CompraId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<VentaCab>().HasMany(x => x.Detalles).WithOne()
            .HasForeignKey(x => x.VentaId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<MovimientoCab>().HasMany(x => x.Detalles).WithOne(x => x.Movimiento)
            .HasForeignKey(x => x.MovimientoId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<CompraDet>().HasOne<Producto>().WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<VentaDet>().HasOne<Producto>().WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Restrict);
        m.Entity<MovimientoDet>().HasOne<Producto>().WithMany().HasForeignKey(x => x.ProductoId).OnDelete(DeleteBehavior.Restrict);
        foreach (var entity in m.Model.GetEntityTypes())
            foreach (var property in entity.GetProperties())
                if (property.ClrType == typeof(decimal))
                { property.SetPrecision(18); property.SetScale(2); }
    }
}
