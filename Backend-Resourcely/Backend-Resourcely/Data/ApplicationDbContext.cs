using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Models;

namespace Backend_Resourcely.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Building> Buildings { get; set; }
        public DbSet<Floor> Floors { get; set; }
        public DbSet<Block> Blocks { get; set; }
        public DbSet<Location> Locations { get; set; }
        public DbSet<ResourceAvailability> ResourceAvailabilities { get; set; }
        public DbSet<Booking> Bookings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Building entity
            modelBuilder.Entity<Building>(entity =>
            {
                entity.HasKey(e => e.BuildingID);
                entity.Property(e => e.BuildingName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.HasIndex(e => e.BuildingName).IsUnique();
            });

            // Configure Floor entity
            modelBuilder.Entity<Floor>(entity =>
            {
                entity.HasKey(e => e.FloorID);
                entity.Property(e => e.FloorName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                
                entity.HasOne(e => e.Building)
                    .WithMany(b => b.Floors)
                    .HasForeignKey(e => e.BuildingID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.BuildingID, e.FloorNumber }).IsUnique();
            });

            // Configure Block entity
            modelBuilder.Entity<Block>(entity =>
            {
                entity.HasKey(e => e.BlockID);
                entity.Property(e => e.BlockName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                
                entity.HasOne(e => e.Floor)
                    .WithMany(f => f.Blocks)
                    .HasForeignKey(e => e.FloorID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.FloorID, e.BlockName }).IsUnique();
            });

            // Configure Location entity
            modelBuilder.Entity<Location>(entity =>
            {
                entity.HasKey(e => e.LocationID);
                entity.Property(e => e.LocationName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LocationType).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);
                
                entity.HasOne(e => e.Block)
                    .WithMany(b => b.Locations)
                    .HasForeignKey(e => e.BlockID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.BlockID, e.LocationName }).IsUnique();
            });

            // Configure ResourceAvailability entity
            modelBuilder.Entity<ResourceAvailability>(entity =>
            {
                entity.HasKey(e => e.AvailabilityID);
                entity.Property(e => e.DayOfWeek).HasMaxLength(20);
                
                entity.HasOne(e => e.Location)
                    .WithMany(l => l.ResourceAvailabilities)
                    .HasForeignKey(e => e.LocationID)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Configure Booking entity
            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(e => e.BookingID);
                entity.Property(e => e.Status).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Purpose).IsRequired().HasMaxLength(500);
                
                entity.HasOne(e => e.Creator)
                    .WithMany(u => u.BookingsCreated)
                    .HasForeignKey(e => e.CreatedBy)
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(e => e.Location)
                    .WithMany(l => l.Bookings)
                    .HasForeignKey(e => e.LocationID)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(e => e.Approver)
                    .WithMany(u => u.BookingsApproved)
                    .HasForeignKey(e => e.ApprovedBy)
                    .OnDelete(DeleteBehavior.Restrict)
                    .IsRequired(false);
            });

            // Configure User entity
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserID);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.RoleType).IsRequired().HasMaxLength(50);
                entity.HasIndex(e => e.Email).IsUnique();
            });

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            var seedDate = new DateTime(2025, 9, 21, 0, 0, 0, DateTimeKind.Utc);

            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { UserID = 1, FirstName = "Admin", LastName = "User", Email = "admin@university.edu", RoleType = "admin" },
                new User { UserID = 2, FirstName = "John", LastName = "Lecturer", Email = "john.lecturer@university.edu", RoleType = "lecturer" },
                new User { UserID = 3, FirstName = "Jane", LastName = "Student", Email = "jane.student@university.edu", RoleType = "student" }
            );

            // Seed Buildings
            modelBuilder.Entity<Building>().HasData(
                new Building { BuildingID = 1, BuildingName = "Main Building", Description = "Primary academic building", CreatedAt = seedDate },
                new Building { BuildingID = 2, BuildingName = "Engineering Block", Description = "Engineering and technology departments", CreatedAt = seedDate }
            );

            // Seed Floors
            modelBuilder.Entity<Floor>().HasData(
                new Floor { FloorID = 1, FloorName = "Ground Floor", FloorNumber = 0, BuildingID = 1, Description = "Main entrance and reception", CreatedAt = seedDate },
                new Floor { FloorID = 2, FloorName = "First Floor", FloorNumber = 1, BuildingID = 1, Description = "Lecture halls and classrooms", CreatedAt = seedDate },
                new Floor { FloorID = 3, FloorName = "Ground Floor", FloorNumber = 0, BuildingID = 2, Description = "Engineering labs", CreatedAt = seedDate }
            );

            // Seed Blocks
            modelBuilder.Entity<Block>().HasData(
                new Block { BlockID = 1, BlockName = "Block A", FloorID = 1, Description = "Administration block", CreatedAt = seedDate },
                new Block { BlockID = 2, BlockName = "Block A", FloorID = 2, Description = "Lecture hall block", CreatedAt = seedDate },
                new Block { BlockID = 3, BlockName = "Block B", FloorID = 2, Description = "Classroom block", CreatedAt = seedDate },
                new Block { BlockID = 4, BlockName = "Block A", FloorID = 3, Description = "Computer labs", CreatedAt = seedDate }
            );

            // Seed Locations
            modelBuilder.Entity<Location>().HasData(
                new Location { LocationID = 1, LocationName = "A101", LocationType = "lectureHalls", BlockID = 2, Capacity = 100, Description = "Large lecture hall with projector", CreatedAt = seedDate },
                new Location { LocationID = 2, LocationName = "A102", LocationType = "lectureHalls", BlockID = 2, Capacity = 80, Description = "Medium lecture hall", CreatedAt = seedDate },
                new Location { LocationID = 3, LocationName = "B201", LocationType = "Labs", BlockID = 3, Capacity = 30, Description = "Computer lab", CreatedAt = seedDate },
                new Location { LocationID = 4, LocationName = "B202", LocationType = "meetingRooms", BlockID = 3, Capacity = 15, Description = "Small meeting room", CreatedAt = seedDate },
                new Location { LocationID = 5, LocationName = "E101", LocationType = "Labs", BlockID = 4, Capacity = 25, Description = "Engineering lab", CreatedAt = seedDate }
            );
        }
    }
}