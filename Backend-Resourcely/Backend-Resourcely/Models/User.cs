using System.ComponentModel.DataAnnotations;

namespace Backend_Resourcely.Models
{
    public class User
    {
        [Key]
        public int UserID { get; set; }

        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string RoleType { get; set; } = string.Empty; // student, lecturer, manager, admin

        // Navigation properties
        public ICollection<Booking> BookingsCreated { get; set; } = new List<Booking>();
        public ICollection<Booking> BookingsApproved { get; set; } = new List<Booking>();
    }
}