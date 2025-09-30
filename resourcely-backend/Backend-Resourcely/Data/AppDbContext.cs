using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public virtual DbSet<Booking> Bookings { get; set; }
        public DbSet<Building> Buildings { get; set; }
        public DbSet<Floor> Floors { get; set; }
        public DbSet<Block> Blocks { get; set; }
        public DbSet<Resource> Resources { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
                entity.Property(u => u.Username).IsRequired().HasMaxLength(100);
                entity.Property(u => u.Role).IsRequired().HasMaxLength(50);
                entity.HasIndex(u => u.Email).IsUnique();
            });

            // Building entity
            modelBuilder.Entity<Building>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Name).IsRequired().HasMaxLength(200);
                entity.Property(b => b.Description).HasMaxLength(500);
            });

            // Floor entity
            modelBuilder.Entity<Floor>(entity =>
            {
                entity.HasKey(f => f.Id);
                entity.Property(f => f.Name).IsRequired().HasMaxLength(100);
                entity.Property(f => f.Description).HasMaxLength(500);
                
                entity.HasOne(f => f.Building)
                    .WithMany(b => b.Floors)
                    .HasForeignKey(f => f.BuildingId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Block entity
            modelBuilder.Entity<Block>(entity =>
            {
                entity.HasKey(bl => bl.Id);
                entity.Property(bl => bl.Name).IsRequired().HasMaxLength(100);
                entity.Property(bl => bl.Description).HasMaxLength(500);
                
                entity.HasOne(bl => bl.Floor)
                    .WithMany(f => f.Blocks)
                    .HasForeignKey(bl => bl.FloorId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Resource entity
            modelBuilder.Entity<Resource>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Name).IsRequired().HasMaxLength(200);
                entity.Property(r => r.Type).IsRequired().HasMaxLength(100);
                entity.Property(r => r.Description).HasMaxLength(500);
                entity.Property(r => r.Capacity).IsRequired();
                
                entity.HasOne(r => r.Block)
                    .WithMany(bl => bl.Resources)
                    .HasForeignKey(r => r.BlockId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.Property(b => b.Reason).IsRequired().HasMaxLength(2000);
                entity.Property(b => b.Contact).IsRequired().HasMaxLength(200);
                entity.Property(b => b.Capacity).IsRequired();
                entity.Property(b => b.BookingAt).IsRequired();
                entity.Property(b => b.EndAt).IsRequired();
                entity.Property(b => b.UserId).IsRequired();

                entity.HasOne(b => b.Resource)
                    .WithMany(r => r.Bookings)
                    .HasForeignKey(b => b.ResourceId)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}