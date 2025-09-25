using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Backend_Resourcely.Models
{
    public class Floor
    {
        [Key]
        public int FloorID { get; set; }

        [Required]
        [StringLength(100)]
        public string FloorName { get; set; } = string.Empty;

        [Required]
        public int FloorNumber { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign key
        [Required]
        public int BuildingID { get; set; }

        // Navigation properties
        [ForeignKey("BuildingID")]
        public Building Building { get; set; } = null!;
        public ICollection<Block> Blocks { get; set; } = new List<Block>();
    }
}