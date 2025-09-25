namespace Backend_Resourcely.DTOs
{
    public class AvailabilityCheckDto
    {
        public int LocationID { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
    }

    public class AvailabilityResponseDto
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public bool IsAvailable { get; set; }
        public List<ConflictingBookingDto> ConflictingBookings { get; set; } = new List<ConflictingBookingDto>();
        public List<AvailableSlotDto> AvailableSlots { get; set; } = new List<AvailableSlotDto>();
    }

    public class ConflictingBookingDto
    {
        public int BookingID { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
    }

    public class AvailableSlotDto
    {
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
    }

    public class CreateBookingDto
    {
        public int LocationID { get; set; }
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public string Purpose { get; set; } = string.Empty;
    }

    public class BookingDto
    {
        public int BookingID { get; set; }
        public int CreatedBy { get; set; }
        public string CreatorName { get; set; } = string.Empty;
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public DateTime StartsAt { get; set; }
        public DateTime EndsAt { get; set; }
        public string Status { get; set; } = string.Empty;
        public string Purpose { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int? ApprovedBy { get; set; }
        public string? ApproverName { get; set; }
        public DateTime? ApprovedDateTime { get; set; }
    }
}