using System.ComponentModel.DataAnnotations;

namespace Backend_Resourcely.Models
{
    public class Building
    {
        [Key]
        public int BuildingID { get; set; }

        [Required]
        [StringLength(100)]
        public string BuildingName { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Floor> Floors { get; set; } = new List<Floor>();
    }
}