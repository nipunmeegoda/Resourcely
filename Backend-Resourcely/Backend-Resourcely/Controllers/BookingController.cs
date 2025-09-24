using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;

        public BookingsController(AppDbContext db)
        {
            _db = db;
        }

        [HttpPost]
        public async Task<ActionResult<BookingDto>> Create(BookingCreateDto dto)
        {
            if (dto.CreatedBy <= 0 || dto.LocationID <= 0 || 
                dto.StartsAt >= dto.EndsAt || 
                string.IsNullOrWhiteSpace(dto.Purpose))
            {
                return BadRequest(new { message = "Invalid booking data." });
            }

            // Check if user exists
            var user = await _db.Users.FirstOrDefaultAsync(u => u.UserID == dto.CreatedBy);
            if (user == null)
            {
                return BadRequest(new { message = "User not found." });
            }

            // Check if location exists
            var location = await _db.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b!.Floor)
                        .ThenInclude(f => f!.Building)
                .FirstOrDefaultAsync(l => l.LocationID == dto.LocationID);
            
            if (location == null)
            {
                return BadRequest(new { message = "Location not found." });
            }

            var booking = new Booking
            {
                CreatedBy = dto.CreatedBy,
                LocationID = dto.LocationID,
                StartsAt = dto.StartsAt,
                EndsAt = dto.EndsAt,
                Purpose = dto.Purpose.Trim(),
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            var result = new BookingDto
            {
                BookingID = booking.BookingID,
                CreatedBy = booking.CreatedBy,
                CreatedByName = $"{user.FirstName} {user.LastName}",
                LocationID = booking.LocationID,
                LocationName = location.LocationName,
                LocationDetails = $"{location.Block?.BlockName} - {location.Block?.Floor?.FloorName}, {location.Block?.Floor?.Building?.BuildingName}",
                StartsAt = booking.StartsAt,
                EndsAt = booking.EndsAt,
                Status = booking.Status,
                Purpose = booking.Purpose,
                CreatedAt = booking.CreatedAt
            };

            return CreatedAtAction(nameof(GetById), new { id = booking.BookingID }, result);
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<BookingDto>> GetById(int id)
        {
            var booking = await _db.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Approver)
                .Include(b => b.Location)
                    .ThenInclude(l => l!.Block)
                        .ThenInclude(b => b!.Floor)
                            .ThenInclude(f => f!.Building)
                .FirstOrDefaultAsync(b => b.BookingID == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            var result = MapToDto(booking);
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetAll()
        {
            var bookings = await _db.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Approver)
                .Include(b => b.Location)
                    .ThenInclude(l => l!.Block)
                        .ThenInclude(b => b!.Floor)
                            .ThenInclude(f => f!.Building)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            var result = bookings.Select(MapToDto);
            return Ok(result);
        }

        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetPending()
        {
            var pendingBookings = await _db.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                    .ThenInclude(l => l!.Block)
                        .ThenInclude(b => b!.Floor)
                            .ThenInclude(f => f!.Building)
                .Where(b => b.Status == "pending")
                .OrderBy(b => b.CreatedAt)
                .ToListAsync();

            var result = pendingBookings.Select(MapToDto);
            return Ok(result);
        }

        [HttpPatch("{id:int}/status")]
        public async Task<ActionResult<BookingDto>> UpdateStatus(int id, UpdateBookingStatusDto dto)
        {
            var booking = await _db.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                    .ThenInclude(l => l!.Block)
                        .ThenInclude(b => b!.Floor)
                            .ThenInclude(f => f!.Building)
                .FirstOrDefaultAsync(b => b.BookingID == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Only allow status changes for pending bookings
            if (booking.Status != "pending")
            {
                return BadRequest(new { message = "Only pending bookings can be approved or rejected." });
            }

            // Validate the new status
            if (dto.Status != "approved" && dto.Status != "rejected")
            {
                return BadRequest(new { message = "Status must be either 'approved' or 'rejected'." });
            }

            // Check if approver exists
            var approver = await _db.Users.FirstOrDefaultAsync(u => u.UserID == dto.ApprovedBy);
            if (approver == null)
            {
                return BadRequest(new { message = "Approver not found." });
            }

            booking.Status = dto.Status;
            booking.ApprovedBy = dto.ApprovedBy;
            booking.ApprovedDateTime = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // Reload with approver details
            await _db.Entry(booking).Reference(b => b.Approver).LoadAsync();
            
            var result = MapToDto(booking);
            return Ok(result);
        }

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.BookingID == id);
            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            // Block deleting past bookings
            if (booking.StartsAt <= DateTime.Now)
            {
                return BadRequest(new { message = "Cannot delete past or ongoing bookings." });
            }

            _db.Bookings.Remove(booking);
            await _db.SaveChangesAsync();
            return NoContent();
        }

        [HttpGet("locations")]
        public async Task<ActionResult<IEnumerable<LocationDto>>> GetLocations()
        {
            var locations = await _db.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b!.Floor)
                        .ThenInclude(f => f!.Building)
                .OrderBy(l => l.LocationName)
                .ToListAsync();

            var result = locations.Select(l => new LocationDto
            {
                LocationID = l.LocationID,
                LocationName = l.LocationName,
                LocationType = l.LocationType,
                Capacity = l.Capacity,
                Description = l.Description,
                BlockName = l.Block?.BlockName ?? "",
                FloorName = l.Block?.Floor?.FloorName ?? "",
                BuildingName = l.Block?.Floor?.Building?.BuildingName ?? ""
            });

            return Ok(result);
        }

        private static BookingDto MapToDto(Booking booking)
        {
            return new BookingDto
            {
                BookingID = booking.BookingID,
                CreatedBy = booking.CreatedBy,
                CreatedByName = booking.Creator != null ? $"{booking.Creator.FirstName} {booking.Creator.LastName}" : "",
                LocationID = booking.LocationID,
                LocationName = booking.Location?.LocationName ?? "",
                LocationDetails = booking.Location != null 
                    ? $"{booking.Location.Block?.BlockName} - {booking.Location.Block?.Floor?.FloorName}, {booking.Location.Block?.Floor?.Building?.BuildingName}"
                    : "",
                StartsAt = booking.StartsAt,
                EndsAt = booking.EndsAt,
                Status = booking.Status,
                Purpose = booking.Purpose,
                CreatedAt = booking.CreatedAt,
                ApprovedBy = booking.ApprovedBy,
                ApprovedByName = booking.Approver != null ? $"{booking.Approver.FirstName} {booking.Approver.LastName}" : null,
                ApprovedDateTime = booking.ApprovedDateTime
            };
        }
    }
}