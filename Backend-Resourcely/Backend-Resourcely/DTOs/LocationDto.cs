namespace Backend_Resourcely.DTOs
{
    public class LocationDto
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string LocationType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? Capacity { get; set; }
        public int BlockID { get; set; }
        public string BlockName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }

    public class CreateLocationDto
    {
        public string LocationName { get; set; } = string.Empty;
        public string LocationType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? Capacity { get; set; }
        public int BlockID { get; set; }
    }

    public class UpdateLocationDto
    {
        public string LocationName { get; set; } = string.Empty;
        public string LocationType { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int? Capacity { get; set; }
    }

    public class LocationHierarchyDto
    {
        public int LocationID { get; set; }
        public string LocationName { get; set; } = string.Empty;
        public string LocationType { get; set; } = string.Empty;
        public int? Capacity { get; set; }
        public int BlockID { get; set; }
        public string BlockName { get; set; } = string.Empty;
        public int FloorID { get; set; }
        public string FloorName { get; set; } = string.Empty;
        public int FloorNumber { get; set; }
        public int BuildingID { get; set; }
        public string BuildingName { get; set; } = string.Empty;
    }
}