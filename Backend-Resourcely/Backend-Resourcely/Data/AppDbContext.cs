using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Booking> Bookings => Set<Booking>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Block> Blocks => Set<Block>();
        public DbSet<Floor> Floors => Set<Floor>();
        public DbSet<Building> Buildings => Set<Building>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.BookingID);
                entity.Property(b => b.CreatedBy).IsRequired();
                entity.Property(b => b.LocationID).IsRequired();
                entity.Property(b => b.StartsAt).IsRequired();
                entity.Property(b => b.EndsAt).IsRequired();
                entity.Property(b => b.Status).IsRequired().HasMaxLength(50).HasDefaultValue("pending");
                entity.Property(b => b.Purpose).IsRequired().HasMaxLength(2000);
                entity.Property(b => b.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                // Relationships
                entity.HasOne(b => b.Creator)
                      .WithMany()
                      .HasForeignKey(b => b.CreatedBy)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(b => b.Approver)
                      .WithMany()
                      .HasForeignKey(b => b.ApprovedBy)
                      .OnDelete(DeleteBehavior.Restrict);
                      
                entity.HasOne(b => b.Location)
                      .WithMany()
                      .HasForeignKey(b => b.LocationID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.UserID);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(255);
                entity.Property(u => u.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.LastName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.RoleType).IsRequired().HasMaxLength(50);
            });

            // Configure Location entity
            modelBuilder.Entity<Location>(entity =>
            {
                entity.HasKey(l => l.LocationID);
                entity.Property(l => l.LocationName).IsRequired().HasMaxLength(100);
                entity.Property(l => l.LocationType).IsRequired().HasMaxLength(50);
                entity.Property(l => l.Description).HasMaxLength(500);
                entity.Property(l => l.Capacity).IsRequired();
                entity.Property(l => l.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(l => l.Block)
                      .WithMany()
                      .HasForeignKey(l => l.BlockID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Block entity
            modelBuilder.Entity<Block>(entity =>
            {
                entity.HasKey(b => b.BlockID);
                entity.Property(b => b.BlockName).IsRequired().HasMaxLength(100);
                entity.Property(b => b.Description).HasMaxLength(500);
                entity.Property(b => b.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(b => b.Floor)
                      .WithMany()
                      .HasForeignKey(b => b.FloorID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Floor entity
            modelBuilder.Entity<Floor>(entity =>
            {
                entity.HasKey(f => f.FloorID);
                entity.Property(f => f.FloorName).IsRequired().HasMaxLength(100);
                entity.Property(f => f.Description).HasMaxLength(500);
                entity.Property(f => f.FloorNumber).IsRequired();
                entity.Property(f => f.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
                
                entity.HasOne(f => f.Building)
                      .WithMany()
                      .HasForeignKey(f => f.BuildingID)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // Configure Building entity
            modelBuilder.Entity<Building>(entity =>
            {
                entity.HasKey(b => b.BuildingID);
                entity.Property(b => b.BuildingName).IsRequired().HasMaxLength(100);
                entity.Property(b => b.Description).HasMaxLength(500);
                entity.Property(b => b.CreatedAt).IsRequired().HasDefaultValueSql("CURRENT_TIMESTAMP");
            });
        }
    }
}