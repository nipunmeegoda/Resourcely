using System.ComponentModel.DataAnnotations;

namespace Backend_Resourcely.Models
{
    public class Department
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        // Navigation property for the lecturers in this department
        public virtual ICollection<LecturerProfile> LecturerProfiles { get; set; } = new List<LecturerProfile>();
    }
}
