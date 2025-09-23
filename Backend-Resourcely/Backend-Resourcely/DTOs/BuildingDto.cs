namespace Backend_Resourcely.DTOs
{
    public class BuildingDto
    {
        public int BuildingID { get; set; }
        public string BuildingName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<FloorDto> Floors { get; set; } = new List<FloorDto>();
    }

    public class CreateBuildingDto
    {
        public string BuildingName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }

    public class UpdateBuildingDto
    {
        public string BuildingName { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}