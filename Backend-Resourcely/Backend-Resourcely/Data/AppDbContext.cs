using Backend_Resourcely.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Data
{
   public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>   //added the new roles
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Booking> Bookings => Set<Booking>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder); // Important for Identity

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