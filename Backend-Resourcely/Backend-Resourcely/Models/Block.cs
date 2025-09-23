using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_Resourcely.Models
{
    public class Block
    {
        [Key]
        public int BlockID { get; set; }

        [Required]
        [StringLength(100)]
        public string BlockName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        [Required]
        public int FloorID { get; set; }

        // Navigation properties
        [ForeignKey("FloorID")]
        public Floor Floor { get; set; } = null!;
        public ICollection<Location> Locations { get; set; } = new List<Location>();
    }
}