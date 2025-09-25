using System;

namespace Backend_Resourcely.Models
{
    public enum BookingStatus
    {
        Pending,
        Approved,
        Rejected
    }

    public class Booking
    {
        public int Id { get; set; }
        public string?  UserId { get; set; }
        public string Location { get; set; } = string.Empty;
        public DateTime BookingAt { get; set; }
        public string Reason { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Contact { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public BookingStatus Status { get; set; } = BookingStatus.Pending;
    }
}