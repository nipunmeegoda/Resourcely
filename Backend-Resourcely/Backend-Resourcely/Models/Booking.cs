using System;

namespace Backend_Resourcely.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public string? UserId { get; set; }
        public int ResourceId { get; set; }
        public DateTime BookingAt { get; set; }
        public DateTime EndAt { get; set; } // Add end time for proper availability checking
        public string Reason { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Contact { get; set; } = string.Empty;
        public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected
        public string? ApprovedBy { get; set; } // Admin who approved/rejected
        public DateTime? ApprovedAt { get; set; }
        public string? RejectionReason { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation property
        public virtual Resource Resource { get; set; } = null!;
    }
}