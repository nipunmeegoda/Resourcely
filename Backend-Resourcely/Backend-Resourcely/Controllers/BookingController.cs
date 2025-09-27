    using System.Globalization;
    using Backend_Resourcely.Data;
    using Backend_Resourcely.Models;
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
                public int ResourceId { get; set; }
                public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
                public string Time { get; set; } = string.Empty; // "HH:mm"
                public string EndTime { get; set; } = string.Empty; // "HH:mm"
                public string Reason { get; set; } = string.Empty;
                public int Capacity { get; set; }
                public string Contact { get; set; } = string.Empty;
                public int? UserId { get; set; }
            }

            public class BookingApprovalDto
            {
                public int BookingId { get; set; }
                public bool IsApproved { get; set; }
                public string AdminId { get; set; } = string.Empty;
                public string? AdminNote { get; set; }
            }

            [HttpPost]
            public async Task<ActionResult<object>> Create(BookingCreateDto dto)
            {
                if (dto.ResourceId <= 0 ||
                    string.IsNullOrWhiteSpace(dto.Date) ||
                    string.IsNullOrWhiteSpace(dto.Time) ||
                    string.IsNullOrWhiteSpace(dto.EndTime) ||
                    string.IsNullOrWhiteSpace(dto.Reason) ||
                    string.IsNullOrWhiteSpace(dto.Contact) ||
                    dto.Capacity <= 0)
                {
                    return BadRequest(new { message = "All fields are required and capacity must be positive." });
                }

                // Parse booking start and end times
                if (!DateTime.TryParseExact(
                        $"{dto.Date} {dto.Time}",
                        "yyyy-MM-dd HH:mm",
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var bookingAt))
                {
                    return BadRequest(new { message = "Invalid date/time format for start time." });
                }

                if (!DateTime.TryParseExact(
                        $"{dto.Date} {dto.EndTime}",
                        "yyyy-MM-dd HH:mm",
                        CultureInfo.InvariantCulture,
                        DateTimeStyles.None,
                        out var endAt))
                {
                    return BadRequest(new { message = "Invalid date/time format for end time." });
                }

                if (endAt <= bookingAt)
                {
                    return BadRequest(new { message = "End time must be after start time." });
                }

                // Check if resource exists and is active
                var resource = await _db.Resources
                    .Include(r => r.Block)
                    .ThenInclude(b => b.Floor)
                    .ThenInclude(f => f.Building)
                    .FirstOrDefaultAsync(r => r.Id == dto.ResourceId);

                if (resource == null || !resource.IsActive)
                {
                    return BadRequest(new { message = "Resource not found or not available." });
                }

                // Check if requested capacity exceeds resource capacity
                if (dto.Capacity > resource.Capacity)
                {
                    return BadRequest(new { message = $"Requested capacity ({dto.Capacity}) exceeds resource capacity ({resource.Capacity})." });
                }

                // Check for overlapping bookings (prevent double-booking)
                var overlappingBooking = await _db.Bookings
                    .Where(b => b.ResourceId == dto.ResourceId &&
                               ((bookingAt < b.EndAt && endAt > b.BookingAt)))
                    .FirstOrDefaultAsync();

                if (overlappingBooking != null)
                {
                    return BadRequest(new { message = "Resource is already booked during the requested time slot." });
                }

                var userId = dto.UserId ?? 1;

                var booking = new Booking
                {
                    UserId = userId.ToString(),
                    ResourceId = dto.ResourceId,
                    BookingAt = bookingAt,
                    EndAt = endAt,
                    Reason = dto.Reason.Trim(),
                    Capacity = dto.Capacity,
                    Contact = dto.Contact.Trim(),
                    CreatedAt = DateTime.UtcNow,
                    Status = BookingStatus.Pending
                };

                _db.Bookings.Add(booking);
                await _db.SaveChangesAsync();

                return CreatedAtAction(nameof(GetById), new { id = booking.Id }, new
                {
                    booking.Id,
                    booking.UserId,
                    booking.ResourceId,
                    ResourceName = resource.Name,
                    ResourceLocation = $"{resource.Block.Floor.Building.Name} > {resource.Block.Floor.Name} > {resource.Block.Name} > {resource.Name}",
                    BookingAt = booking.BookingAt,
                    EndAt = booking.EndAt,
                    booking.Reason,
                    booking.Capacity,
                    booking.Contact,
                    booking.CreatedAt,
                    booking.Status
                });
            }

            [HttpGet]
            public async Task<ActionResult<IEnumerable<object>>> GetAll([FromQuery] string? status = null)
            {
                var query = _db.Bookings.AsNoTracking();

                if (!string.IsNullOrEmpty(status) && Enum.TryParse<BookingStatus>(status, true, out var bookingStatus))
                {
                    query = query.Where(b => b.Status == bookingStatus);
                }

                var bookings = await query
                    .OrderByDescending(b => b.CreatedAt)
                    .Select(b => new
                    {
                        b.Id,
                        b.UserId,
                        b.Location,
                        b.BookingAt,
                        b.Reason,
                        b.Capacity,
                        b.Contact,
                        b.CreatedAt,
                        b.Status,
                        b.ApprovedByAdminId,
                        b.ApprovedAt,
                        b.AdminNote
                    })
                    .ToListAsync();

                return Ok(bookings);
            }

            [HttpGet("pending")]
            public async Task<ActionResult<IEnumerable<object>>> GetPendingBookings()
            {
                var pendingBookings = await _db.Bookings
                    .AsNoTracking()
                    .Where(b => b.Status == BookingStatus.Pending)
                    .OrderBy(b => b.CreatedAt)
                    .Select(b => new
                    {
                        b.Id,
                        b.UserId,
                        b.Location,
                        b.BookingAt,
                        b.Reason,
                        b.Capacity,
                        b.Contact,
                        b.CreatedAt
                    })
                    .ToListAsync();

                return Ok(pendingBookings);
            }

            [HttpPost("approve")]
            public async Task<ActionResult> ApproveBooking(BookingApprovalDto dto)
            {
                var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == dto.BookingId);
                if (booking == null)
                {
                    return NotFound(new { message = "Booking not found." });
                }

                if (booking.Status != BookingStatus.Pending)
                {
                    return BadRequest(new { message = "Only pending bookings can be approved or rejected." });
                }

                booking.Status = dto.IsApproved ? BookingStatus.Approved : BookingStatus.Rejected;
                booking.ApprovedByAdminId = dto.AdminId;
                booking.ApprovedAt = DateTime.UtcNow;
                booking.AdminNote = dto.AdminNote;

                await _db.SaveChangesAsync();

                return Ok(new 
                { 
                    message = $"Booking {(dto.IsApproved ? "approved" : "rejected")} successfully.",
                    booking = new
                    {
                        booking.Id,
                        booking.Status,
                        booking.ApprovedByAdminId,
                        booking.ApprovedAt,
                        booking.AdminNote
                    }
                });
            }

            [HttpGet("{id:int}")]
            public async Task<ActionResult<object>> GetById(int id)
            {
                var booking = await _db.Bookings
                    .AsNoTracking()
                    .Where(b => b.Id == id)
                    .Include(b => b.Resource)
                    .ThenInclude(r => r.Block)
                    .ThenInclude(bl => bl.Floor)
                    .ThenInclude(f => f.Building)
                    .Select(b => new
                    {
                        b.Id,
                        b.UserId,
                        b.ResourceId,
                        ResourceName = b.Resource.Name,
                        ResourceLocation = $"{b.Resource.Block.Floor.Building.Name} > {b.Resource.Block.Floor.Name} > {b.Resource.Block.Name} > {b.Resource.Name}",
                        BookingAt = b.BookingAt,
                        EndAt = b.EndAt,
                        b.Reason,
                        b.Capacity,
                        b.Contact,
                        b.CreatedAt
                    })
                    .FirstOrDefaultAsync();

                return booking is null ? NotFound() : Ok(booking);
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

            // GET: api/bookings/by-resource/{resourceId}
            [HttpGet("by-resource/{resourceId:int}")]
            public async Task<ActionResult<IEnumerable<object>>> GetBookingsByResource(int resourceId, [FromQuery] DateTime? date)
            {
                var query = _db.Bookings
                    .AsNoTracking()
                    .Where(b => b.ResourceId == resourceId);

                if (date.HasValue)
                {
                    var startDate = date.Value.Date;
                    var endDate = startDate.AddDays(1);
                    query = query.Where(b => b.BookingAt >= startDate && b.BookingAt < endDate);
                }

                var bookings = await query
                    .Select(b => new
                    {
                        b.Id,
                        b.UserId,
                        BookingAt = b.BookingAt,
                        EndAt = b.EndAt,
                        b.Reason,
                        b.Capacity,
                        b.Contact,
                        b.CreatedAt
                    })
                    .OrderBy(b => b.BookingAt)
                    .ToListAsync();

                return Ok(bookings);
            }
        }
    }