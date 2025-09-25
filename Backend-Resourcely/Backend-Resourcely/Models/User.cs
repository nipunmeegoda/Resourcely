using System;
using System.Collections.Generic;
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
        public string RoleType { get; set; } = "User"; // student, lecturer, manager, admin

        // Authentication
        [Required]
        public string PasswordHash { get; set; } = string.Empty;

        [Required]
        public string PasswordSalt { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<Booking> BookingsCreated { get; set; } = new List<Booking>();
        public ICollection<Booking> BookingsApproved { get; set; } = new List<Booking>();
    }
}
