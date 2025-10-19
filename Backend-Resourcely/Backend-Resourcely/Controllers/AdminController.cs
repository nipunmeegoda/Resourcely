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

            var now = DateTime.UtcNow;
            var today = now.Date;
            
            var stats = new
            {
                totalBookings = await _db.Bookings.CountAsync(),
                activeRooms = await _db.Resources.CountAsync(r => r.IsActive),
                availableNow = await _db.Resources
                    .Where(r => r.IsActive)
                    .CountAsync(r => !_db.Bookings.Any(b => 
                        b.ResourceId == r.Id && 
                        b.Status == "Approved" && 
                        b.BookingAt <= now &&
                        b.EndAt > now)),
                pendingApproval = await _db.Bookings.CountAsync(b => b.Status == "Pending"),
                // Additional stats for reference
                totalBuildings = await _db.Buildings.CountAsync(),
                totalFloors = await _db.Floors.CountAsync(),
                totalBlocks = await _db.Blocks.CountAsync(),
                upcomingBookings = await _db.Bookings.CountAsync(b => b.BookingAt > now && b.Status == "Approved")
            };

            return Ok(stats);
        }

        // GET: api/admin/bookings/pending
        [HttpGet("bookings/pending")]
        public async Task<ActionResult<IEnumerable<object>>> GetPendingBookings()
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var bookings = await _db.Bookings
                .Where(b => b.Status == "Pending")
                .Include(b => b.Resource)
                .ThenInclude(r => r.Block)
                .ThenInclude(bl => bl.Floor)
                .ThenInclude(f => f.Building)
                .OrderBy(b => b.CreatedAt)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.ResourceId,
                    ResourceName = b.Resource.Name,
                    ResourceLocation = $"{b.Resource.Block.Floor.Building.Name} > {b.Resource.Block.Floor.Name} > {b.Resource.Block.Name} > {b.Resource.Name}",
                    b.BookingAt,
                    b.EndAt,
                    b.Reason,
                    b.Capacity,
                    b.Contact,
                    b.CreatedAt,
                    b.Status
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/admin/bookings/approved
        [HttpGet("bookings/approved")]
        public async Task<ActionResult<IEnumerable<object>>> GetApprovedBookings()
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var bookings = await _db.Bookings
                .Where(b => b.Status == "Approved")
                .Include(b => b.Resource)
                .ThenInclude(r => r.Block)
                .ThenInclude(bl => bl.Floor)
                .ThenInclude(f => f.Building)
                .OrderByDescending(b => b.ApprovedAt)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.ResourceId,
                    ResourceName = b.Resource.Name,
                    ResourceLocation = $"{b.Resource.Block.Floor.Building.Name} > {b.Resource.Block.Floor.Name} > {b.Resource.Block.Name} > {b.Resource.Name}",
                    b.BookingAt,
                    b.EndAt,
                    b.Reason,
                    b.Capacity,
                    b.Contact,
                    b.CreatedAt,
                    b.Status,
                    b.ApprovedBy,
                    b.ApprovedAt
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/admin/bookings/rejected
        [HttpGet("bookings/rejected")]
        public async Task<ActionResult<IEnumerable<object>>> GetRejectedBookings()
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var bookings = await _db.Bookings
                .Where(b => b.Status == "Rejected")
                .Include(b => b.Resource)
                .ThenInclude(r => r.Block)
                .ThenInclude(bl => bl.Floor)
                .ThenInclude(f => f.Building)
                .OrderByDescending(b => b.ApprovedAt)
                .Select(b => new
                {
                    b.Id,
                    b.UserId,
                    b.ResourceId,
                    ResourceName = b.Resource.Name,
                    ResourceLocation = $"{b.Resource.Block.Floor.Building.Name} > {b.Resource.Block.Floor.Name} > {b.Resource.Block.Name} > {b.Resource.Name}",
                    b.BookingAt,
                    b.EndAt,
                    b.Reason,
                    b.Capacity,
                    b.Contact,
                    b.CreatedAt,
                    b.Status,
                    b.ApprovedBy,
                    b.ApprovedAt,
                    b.RejectionReason
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // PUT: api/admin/bookings/{id}/approve
        [HttpPut("bookings/{id}/approve")]
        public async Task<ActionResult> ApproveBooking(int id)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            if (booking.Status != "Pending")
            {
                return BadRequest(new { message = "Only pending bookings can be approved." });
            }

            booking.Status = "Approved";
            booking.ApprovedBy = "Admin"; // TODO: Use actual admin user info
            booking.ApprovedAt = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            return Ok(new { message = "Booking approved successfully." });
        }

        // PUT: api/admin/bookings/{id}/reject
        [HttpPut("bookings/{id}/reject")]
        public async Task<ActionResult> RejectBooking(int id, [FromBody] RejectBookingRequest request)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var booking = await _db.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            if (booking.Status != "Pending")
            {
                return BadRequest(new { message = "Only pending bookings can be rejected." });
            }

            if (string.IsNullOrWhiteSpace(request.Reason))
            {
                return BadRequest(new { message = "Rejection reason is required." });
            }

            booking.Status = "Rejected";
            booking.ApprovedBy = "Admin"; // TODO: Use actual admin user info
            booking.ApprovedAt = DateTime.UtcNow;
            booking.RejectionReason = request.Reason.Trim();

            await _db.SaveChangesAsync();

            return Ok(new { message = "Booking rejected successfully." });
        }

        // POST: api/admin/bookings/create
        [HttpPost("bookings/create")]
        public async Task<ActionResult<Booking>> CreateApprovedBooking([FromBody] CreateApprovedBookingRequest request)
        {
            if (!IsAdmin())
            {
                return Forbid("Admin access required.");
            }

            var resource = await _db.Resources.FindAsync(request.ResourceId);
            if (resource == null || !resource.IsActive)
            {
                return BadRequest(new { message = "Active resource not found." });
            }

            var user = await _db.Users.FindAsync(request.UserId);
            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            var booking = new Booking
            {
                ResourceId = request.ResourceId,
                UserId = request.UserId,
                BookingAt = request.BookingAt,
                EndAt = request.EndAt,
                Reason = request.Reason,
                Capacity = request.Capacity,
                Contact = request.Contact,
                Status = "Approved", // Automatically approved
                ApprovedBy = "Admin", // TODO: Use actual admin user info
                ApprovedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow
            };

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            return CreatedAtAction(nameof(GetApprovedBookings), new { id = booking.Id }, booking);
        }

        public class RejectBookingRequest
        {
            public string Reason { get; set; } = string.Empty;
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

        public class CreateApprovedBookingRequest
        {
            public int ResourceId { get; set; }
            public int UserId { get; set; }
            public DateTime BookingAt { get; set; }
            public DateTime EndAt { get; set; }
            public string Reason { get; set; } = string.Empty;
            public int Capacity { get; set; }
            public string Contact { get; set; } = string.Empty;
        }
    }
}