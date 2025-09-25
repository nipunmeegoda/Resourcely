namespace Backend_Resourcely.DTOs
{
    public class FloorDto
    {
        public int FloorID { get; set; }
        public string FloorName { get; set; } = string.Empty;
        public int FloorNumber { get; set; }
        public string? Description { get; set; }
        public int BuildingID { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public List<BlockDto> Blocks { get; set; } = new List<BlockDto>();
    }

    public class CreateFloorDto
    {
        public string FloorName { get; set; } = string.Empty;
        public int FloorNumber { get; set; }
        public string? Description { get; set; }
        public int BuildingID { get; set; }
    }

    public class UpdateFloorDto
    {
        public string FloorName { get; set; } = string.Empty;
        public int FloorNumber { get; set; }
        public string? Description { get; set; }
    }
}