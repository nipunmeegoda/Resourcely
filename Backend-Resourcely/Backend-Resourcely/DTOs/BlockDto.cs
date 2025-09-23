namespace Backend_Resourcely.DTOs
{
    public class BlockDto
    {
        public int BlockID { get; set; }
        public string BlockName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int FloorID { get; set; }
        public string FloorName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<LocationDto> Locations { get; set; } = new List<LocationDto>();
    }

    public class CreateBlockDto
    {
        public string BlockName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int FloorID { get; set; }
    }

    public class UpdateBlockDto
    {
        public string BlockName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}