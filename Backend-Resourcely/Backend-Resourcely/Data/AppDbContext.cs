using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Location).IsRequired().HasMaxLength(200);
                entity.Property(b => b.Reason).IsRequired().HasMaxLength(2000);
                entity.Property(b => b.Contact).IsRequired().HasMaxLength(200);
                entity.Property(b => b.Capacity).IsRequired();
                entity.Property(b => b.BookingAt).IsRequired();
                entity.Property(b => b.UserId).IsRequired();
            });
        }
    }
}