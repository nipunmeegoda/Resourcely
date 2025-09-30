using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _db;

        public AdminController(AppDbContext db)
        {
            _db = db;
        }

        // Helper method to check if user is admin (simplified for now)
        private bool IsAdmin()
        {
            // TODO: Implement proper authentication and role checking
            // For now, we'll assume admin access to keep it simple
            return true;
        }

        // POST: api/admin/buildings
        [HttpPost("buildings")]
        public async Task<ActionResult<object>> CreateBuilding(CreateBuildingRequest request)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest(new { message = "Building name is required." });
            }

            var building = new Building
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? "",
                CreatedAt = DateTime.UtcNow
            };

            _db.Buildings.Add(building);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                building.Id,
                building.Name,
                building.Description,
                building.CreatedAt,
                message = "Building created successfully."
            });
        }

        // POST: api/admin/floors
        [HttpPost("floors")]
        public async Task<ActionResult<object>> CreateFloor(CreateFloorRequest request)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            if (string.IsNullOrWhiteSpace(request.Name) || request.BuildingId <= 0)
            {
                return BadRequest(new { message = "Floor name and building ID are required." });
            }

            var buildingExists = await _db.Buildings.AnyAsync(b => b.Id == request.BuildingId);
            if (!buildingExists)
            {
                return BadRequest(new { message = "Invalid building ID." });
            }

            // Calculate the next floor number for this building
            var maxFloorNumber = await _db.Floors
                .Where(f => f.BuildingId == request.BuildingId)
                .Select(f => (int?)f.FloorNumber)
                .MaxAsync() ?? -1;

            var floor = new Floor
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? "",
                BuildingId = request.BuildingId,
                FloorNumber = maxFloorNumber + 1,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Floors.Add(floor);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                floor.Id,
                floor.Name,
                floor.Description,
                floor.BuildingId,
                floor.FloorNumber,
                floor.IsActive,
                floor.CreatedAt,
                message = "Floor created successfully."
            });
        }

        // POST: api/admin/blocks
        [HttpPost("blocks")]
        public async Task<ActionResult<object>> CreateBlock(CreateBlockRequest request)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            if (string.IsNullOrWhiteSpace(request.Name) || request.FloorId <= 0)
            {
                return BadRequest(new { message = "Block name and floor ID are required." });
            }

            var floorExists = await _db.Floors.AnyAsync(f => f.Id == request.FloorId);
            if (!floorExists)
            {
                return BadRequest(new { message = "Invalid floor ID." });
            }

            var block = new Block
            {
                Name = request.Name.Trim(),
                Description = request.Description?.Trim() ?? "",
                FloorId = request.FloorId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Blocks.Add(block);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                block.Id,
                block.Name,
                block.Description,
                block.FloorId,
                block.IsActive,
                block.CreatedAt,
                message = "Block created successfully."
            });
        }

        // POST: api/admin/resources
        [HttpPost("resources")]
        public async Task<ActionResult<object>> CreateResource(CreateResourceRequest request)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            if (string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Type) ||
                request.Capacity <= 0 ||
                request.BlockId <= 0)
            {
                return BadRequest(new { message = "All fields are required and capacity must be positive." });
            }

            var blockExists = await _db.Blocks.AnyAsync(b => b.Id == request.BlockId);
            if (!blockExists)
            {
                return BadRequest(new { message = "Invalid block ID." });
            }

            var resource = new Resource
            {
                Name = request.Name.Trim(),
                Type = request.Type.Trim(),
                Description = request.Description?.Trim() ?? "",
                Capacity = request.Capacity,
                BlockId = request.BlockId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _db.Resources.Add(resource);
            await _db.SaveChangesAsync();

            return Ok(new
            {
                resource.Id,
                resource.Name,
                resource.Type,
                resource.Description,
                resource.Capacity,
                resource.BlockId,
                resource.IsActive,
                resource.CreatedAt,
                message = "Resource created successfully."
            });
        }

        // PUT: api/admin/resources/{id}/toggle
        [HttpPut("resources/{id:int}/toggle")]
        public async Task<ActionResult<object>> ToggleResource(int id)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var resource = await _db.Resources.FindAsync(id);
            if (resource == null)
            {
                return NotFound(new { message = "Resource not found." });
            }

            resource.IsActive = !resource.IsActive;
            await _db.SaveChangesAsync();

            return Ok(new
            {
                resource.Id,
                resource.IsActive,
                message = $"Resource {(resource.IsActive ? "activated" : "deactivated")} successfully."
            });
        }

        // GET: api/admin/overview
        [HttpGet("overview")]
        public async Task<ActionResult<object>> GetOverview()
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var stats = new
            {
                TotalBuildings = await _db.Buildings.CountAsync(),
                TotalFloors = await _db.Floors.CountAsync(),
                TotalBlocks = await _db.Blocks.CountAsync(),
                TotalResources = await _db.Resources.CountAsync(),
                ActiveResources = await _db.Resources.CountAsync(r => r.IsActive),
                TotalBookings = await _db.Bookings.CountAsync(),
                UpcomingBookings = await _db.Bookings.CountAsync(b => b.BookingAt > DateTime.UtcNow)
            };

            return Ok(stats);
        }

        public class CreateBuildingRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
        }

        public class CreateFloorRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int BuildingId { get; set; }
        }

        public class CreateBlockRequest
        {
            public string Name { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int FloorId { get; set; }
        }

        public class CreateResourceRequest
        {
            public string Name { get; set; } = string.Empty;
            public string Type { get; set; } = string.Empty;
            public string? Description { get; set; }
            public int Capacity { get; set; }
            public int BlockId { get; set; }
        }
    }
}