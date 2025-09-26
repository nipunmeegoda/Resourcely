    using System.Globalization;
    using Backend_Resourcely.Data;
    using Backend_Resourcely.Models;
    using Backend_Resourcely.Helpers;
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

            public class BookingCreateDto
            {
                public string Location { get; set; } = string.Empty;
                public string ResourceType { get; set; } = "Regular"; // Regular, Lab, Special
                public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
                public string Time { get; set; } = string.Empty; // "HH:mm"
                public string Reason { get; set; } = string.Empty;
                public int Capacity { get; set; }
                public string Contact { get; set; } = string.Empty;
                public int? UserId { get; set; }
            }

            [HttpPost]
            public async Task<ActionResult<object>> Create(BookingCreateDto dto)
            {
                if (string.IsNullOrWhiteSpace(dto.Location) ||
                    string.IsNullOrWhiteSpace(dto.Date) ||
                    string.IsNullOrWhiteSpace(dto.Time) ||
                    string.IsNullOrWhiteSpace(dto.Reason) ||
                    string.IsNullOrWhiteSpace(dto.Contact) ||
                    dto.Capacity <= 0)
                {
                    return BadRequest(new { message = "Invalid input." });
                }

                // Validate resource type
                if (!PermissionsHelper.IsValidResourceType(dto.ResourceType))
                {
                    return BadRequest(new { message = "Invalid resource type." });
                }

                if (!DateTime.TryParseExact(
                        $"{dto.Date} {dto.Time}",
                        "yyyy-MM-dd HH:mm",
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var bookingAt))
                {
                    return BadRequest(new { message = "Invalid date/time format." });
                }

                var userId = dto.UserId ?? 1;

                // Check user permissions
                var user = await _db.Users.FindAsync(userId);
                if (user == null)
                {
                    return BadRequest(new { message = "User not found." });
                }

                if (!PermissionsHelper.CanUserBookResourceType(user.Role, dto.ResourceType))
                {
                    return Forbid("You don't have permission to book this type of resource.");
                }

                var booking = new Booking
                {
                    UserId = userId.ToString(),
                    Location = dto.Location.Trim(),
                    ResourceType = dto.ResourceType,
                    BookingAt = bookingAt,
                    Reason = dto.Reason.Trim(),
                    Capacity = dto.Capacity,
                    Contact = dto.Contact.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                _db.Bookings.Add(booking);
                await _db.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = booking.Id }, new
                {
                    booking.Id,
                    booking.UserId,
                    booking.Location,
                    booking.ResourceType,
                    BookingAt = booking.BookingAt,
                    booking.Reason,
                    booking.Capacity,
                    booking.Contact,
                    booking.CreatedAt
                });
            }

            [HttpGet("{id:int}")]
            public async Task<ActionResult<Booking>> GetById(int id)
            {
                var booking = await _db.Bookings.AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);
                return booking is null ? NotFound() : Ok(booking);
            }

            [HttpGet]
            public async Task<ActionResult<IEnumerable<object>>> GetAll(int? userId = null)
            {
                var query = _db.Bookings.AsNoTracking();

                // If userId is provided, filter bookings based on user's role and permissions
                if (userId.HasValue)
                {
                    var user = await _db.Users.FindAsync(userId.Value);
                    if (user == null)
                    {
                        return BadRequest(new { message = "User not found." });
                    }

                    // Filter bookings based on what the user can see
                    var allowedResourceTypes = PermissionsHelper.GetAvailableResourceTypes(user.Role);
                    query = query.Where(b => allowedResourceTypes.Contains(b.ResourceType));
                }

                var bookings = await query
                    .OrderBy(b => b.BookingAt)
                    .Select(b => new
                    {
                        b.Id,
                        b.UserId,
                        b.Location,
                        b.ResourceType,
                        b.BookingAt,
                        b.Reason,
                        b.Capacity,
                        b.Contact,
                        b.CreatedAt
                    })
                    .ToListAsync();

                return Ok(bookings);
            }

            [HttpGet("resource-types/{userId:int}")]
            public async Task<ActionResult<string[]>> GetAvailableResourceTypes(int userId)
            {
                var user = await _db.Users.FindAsync(userId);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                var availableTypes = PermissionsHelper.GetAvailableResourceTypes(user.Role);
                return Ok(availableTypes);
            }

            [HttpDelete("{id:int}")]
            public async Task<IActionResult> Delete(int id)
            {
                var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id);
                if (booking is null)
                {
                    return NotFound();
                }

                // Block deleting past bookings
                if (booking.BookingAt <= DateTime.Now)
                {
                    return BadRequest(new { message = "Cannot delete past bookings." });
                }

                _db.Bookings.Remove(booking);
                await _db.SaveChangesAsync();
                return NoContent();
            }
        }
    }