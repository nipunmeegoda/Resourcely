using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_Resourcely.Models
{
    public class Booking
    {
        [Key]
        public int BookingID { get; set; }

        [Required]
        public int CreatedBy { get; set; } // FK → User

        [Required]
        public int LocationID { get; set; } // FK → Location

        [Required]
        public DateTime StartsAt { get; set; }

        [Required]
        public DateTime EndsAt { get; set; }

        [Required]
        [StringLength(50)]
        public string Status { get; set; } = "pending"; 
        // allowed values: pending, approved, rejected, cancelled

        [Required]
        [StringLength(500)]
        public string Purpose { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int? ApprovedBy { get; set; } // FK → User

        public DateTime? ApprovedDateTime { get; set; }

        // Optional extras (from origin/main)
        public int? Capacity { get; set; } 
        public string? Contact { get; set; }

        // Navigation properties
        [ForeignKey("CreatedBy")]
        public User Creator { get; set; } = null!;

        [ForeignKey("LocationID")]
        public Location Location { get; set; } = null!;

        [ForeignKey("ApprovedBy")]
        public User? Approver { get; set; }
    }
}
