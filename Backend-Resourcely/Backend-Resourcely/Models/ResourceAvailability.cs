using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_Resourcely.Models
{
    public class ResourceAvailability
    {
        [Key]
        public int AvailabilityID { get; set; }

        [Required]
        public int LocationID { get; set; }

        [Required]
        public DateOnly Date { get; set; }

        [Required]
        public TimeOnly StartTime { get; set; }

        [Required]
        public TimeOnly EndTime { get; set; }

        [StringLength(20)]
        public string? DayOfWeek { get; set; } // Monday, Tuesday, etc.

        public bool IsRecurring { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        [ForeignKey("LocationID")]
        public Location Location { get; set; } = null!;
    }
}