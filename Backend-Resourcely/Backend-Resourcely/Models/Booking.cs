using System;

namespace Backend_Resourcely.Models
{
    public enum BookingStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }

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
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Approval status fields
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
        public string? ApprovedByAdminId { get; set; }
        public DateTime? ApprovedAt { get; set; }
        public string? AdminNote { get; set; }

    }
}