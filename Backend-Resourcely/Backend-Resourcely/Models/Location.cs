using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_Resourcely.Models
{
    public class Location
    {
        [Key]
        public int LocationID { get; set; }

        [Required]
        [StringLength(100)]
        public string LocationName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string LocationType { get; set; } = string.Empty; // lectureHalls, Labs, meetingRooms

        [StringLength(500)]
        public string? Description { get; set; }

        public int? Capacity { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        [Required]
        public int BlockID { get; set; }

        // Navigation properties
        [ForeignKey("BlockID")]
        public Block Block { get; set; } = null!;
        public ICollection<ResourceAvailability> ResourceAvailabilities { get; set; } = new List<ResourceAvailability>();
        public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    }
}