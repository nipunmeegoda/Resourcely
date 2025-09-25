using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_Resourcely.Models
{
    public enum BookingStatus
    {
        pending = 0,
        approved = 1,
        rejected = 2
    }

    public class Booking
    {
        [Key]
        public int BookingID { get; set; }
        
        public int CreatedBy { get; set; }
        
        public int LocationID { get; set; }
        
        public DateTime StartsAt { get; set; }
        
        public DateTime EndsAt { get; set; }
        
        [Column(TypeName = "varchar(50)")]
        public string Status { get; set; } = "pending";
        
        [MaxLength(2000)]
        public string Purpose { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public int? ApprovedBy { get; set; }
        
        public DateTime? ApprovedDateTime { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public virtual User? Creator { get; set; }

        [ForeignKey("ApprovedBy")]
        public virtual User? Approver { get; set; }

        [ForeignKey("LocationID")]
        public virtual Location? Location { get; set; }
    }

    public class User
    {
        [Key]
        public int UserID { get; set; }
        
        [Required, MaxLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required, MaxLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required, MaxLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Column(TypeName = "varchar(50)")]
        public string RoleType { get; set; } = string.Empty;
    }

    public class Location
    {
        [Key]
        public int LocationID { get; set; }
        
        public int BlockID { get; set; }
        
        public int Capacity { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required, MaxLength(100)]
        public string LocationName { get; set; } = string.Empty;
        
        [Column(TypeName = "varchar(50)")]
        public string LocationType { get; set; } = string.Empty;

        [ForeignKey("BlockID")]
        public virtual Block? Block { get; set; }
    }

    public class Block
    {
        [Key]
        public int BlockID { get; set; }
        
        [Required, MaxLength(100)]
        public string BlockName { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        public int FloorID { get; set; }

        [ForeignKey("FloorID")]
        public virtual Floor? Floor { get; set; }
    }

    public class Floor
    {
        [Key]
        public int FloorID { get; set; }
        
        public int BuildingID { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
        
        [Required, MaxLength(100)]
        public string FloorName { get; set; } = string.Empty;
        
        public int FloorNumber { get; set; }

        [ForeignKey("BuildingID")]
        public virtual Building? Building { get; set; }
    }

    public class Building
    {
        [Key]
        public int BuildingID { get; set; }
        
        [Required, MaxLength(100)]
        public string BuildingName { get; set; } = string.Empty;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        [MaxLength(500)]
        public string Description { get; set; } = string.Empty;
    }
}
