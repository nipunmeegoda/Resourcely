using Backend_Resourcely.Models;

namespace Backend_Resourcely.DTOs
{
    public class BookingDto
    {
        public int BookingID { get; set; }
        public int CreatedBy { get; set; }
        public string CreatedByName { get; set; } = string.Empty;
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string LocationDetails { get; set; } = string.Empty; // Block, Floor, Building info
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public string Status { get; set; } = "pending";
        public string Purpose { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? ApprovedBy { get; set; }
        public string? ApprovedByName { get; set; }
        public DateTime? ApprovedDateTime { get; set; }
    }

    public class BookingCreateDto
    {
        public int CreatedBy { get; set; }
        public int LocationID { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public string Purpose { get; set; } = string.Empty;
    }

    public class UpdateBookingStatusDto
    {
        public string Status { get; set; } = string.Empty; // "approved" or "rejected"
        public int ApprovedBy { get; set; }
    }

    public class LocationDto
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string LocationType { get; set; } = string.Empty;
        public int Capacity { get; set; }
        public string Description { get; set; } = string.Empty;
        public string BlockName { get; set; } = string.Empty;
        public string FloorName { get; set; } = string.Empty;
        public string BuildingName { get; set; } = string.Empty;
    }
}