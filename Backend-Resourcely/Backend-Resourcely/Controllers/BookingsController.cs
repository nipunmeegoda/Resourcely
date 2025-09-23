using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BookingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Bookings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                .Include(b => b.Approver)
                .Select(b => new BookingDto
                {
                    BookingID = b.BookingID,
                    CreatedBy = b.CreatedBy,
                    CreatorName = $"{b.Creator.FirstName} {b.Creator.LastName}",
                    LocationID = b.LocationID,
                    LocationName = b.Location.LocationName,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    CreatedAt = b.CreatedAt,
                    ApprovedBy = b.ApprovedBy,
                    ApproverName = b.Approver != null ? $"{b.Approver.FirstName} {b.Approver.LastName}" : null,
                    ApprovedDateTime = b.ApprovedDateTime
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BookingDto>> GetBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                .Include(b => b.Approver)
                .Where(b => b.BookingID == id)
                .Select(b => new BookingDto
                {
                    BookingID = b.BookingID,
                    CreatedBy = b.CreatedBy,
                    CreatorName = $"{b.Creator.FirstName} {b.Creator.LastName}",
                    LocationID = b.LocationID,
                    LocationName = b.Location.LocationName,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    CreatedAt = b.CreatedAt,
                    ApprovedBy = b.ApprovedBy,
                    ApproverName = b.Approver != null ? $"{b.Approver.FirstName} {b.Approver.LastName}" : null,
                    ApprovedDateTime = b.ApprovedDateTime
                })
                .FirstOrDefaultAsync();

            if (booking == null)
            {
                return NotFound();
            }

            return Ok(booking);
        }

        // POST: api/Bookings
        [HttpPost]
        public async Task<ActionResult<BookingDto>> CreateBooking(CreateBookingDto createBookingDto)
        {
            // Check if location exists
            var location = await _context.Locations.FindAsync(createBookingDto.LocationID);
            if (location == null)
            {
                return BadRequest("Location not found.");
            }

            // Check for overlapping bookings
            var hasConflict = await _context.Bookings
                .AnyAsync(b => b.LocationID == createBookingDto.LocationID &&
                             b.Status != "rejected" &&
                             b.Status != "cancelled" &&
                             b.StartsAt < createBookingDto.EndsAt &&
                             b.EndsAt > createBookingDto.StartsAt);

            if (hasConflict)
            {
                return BadRequest("The requested time slot conflicts with an existing booking.");
            }

            // For this demo, we'll use the first user as the creator
            // In a real application, this would come from the authenticated user
            var defaultUser = await _context.Users.FirstAsync();

            var booking = new Booking
            {
                CreatedBy = defaultUser.UserID,
                LocationID = createBookingDto.LocationID,
                StartsAt = createBookingDto.StartsAt,
                EndsAt = createBookingDto.EndsAt,
                Purpose = createBookingDto.Purpose,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Load the created booking with all relations
            var createdBooking = await _context.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                .Where(b => b.BookingID == booking.BookingID)
                .Select(b => new BookingDto
                {
                    BookingID = b.BookingID,
                    CreatedBy = b.CreatedBy,
                    CreatorName = $"{b.Creator.FirstName} {b.Creator.LastName}",
                    LocationID = b.LocationID,
                    LocationName = b.Location.LocationName,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    CreatedAt = b.CreatedAt,
                    ApprovedBy = b.ApprovedBy,
                    ApproverName = null,
                    ApprovedDateTime = b.ApprovedDateTime
                })
                .FirstAsync();

            return CreatedAtAction(nameof(GetBooking), new { id = booking.BookingID }, createdBooking);
        }

        // PUT: api/Bookings/5/approve
        [HttpPut("{id}/approve")]
        public async Task<IActionResult> ApproveBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != "pending")
            {
                return BadRequest("Only pending bookings can be approved.");
            }

            // For this demo, we'll use the admin user as the approver
            var adminUser = await _context.Users.FirstAsync(u => u.RoleType == "admin");

            booking.Status = "approved";
            booking.ApprovedBy = adminUser.UserID;
            booking.ApprovedDateTime = DateTime.UtcNow;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/Bookings/5/reject
        [HttpPut("{id}/reject")]
        public async Task<IActionResult> RejectBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status != "pending")
            {
                return BadRequest("Only pending bookings can be rejected.");
            }

            booking.Status = "rejected";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // PUT: api/Bookings/5/cancel
        [HttpPut("{id}/cancel")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);

            if (booking == null)
            {
                return NotFound();
            }

            if (booking.Status == "rejected" || booking.Status == "cancelled")
            {
                return BadRequest("Booking is already cancelled or rejected.");
            }

            booking.Status = "cancelled";

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BookingExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }

        // DELETE: api/Bookings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return NotFound();
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // GET: api/Bookings/byLocation/5
        [HttpGet("byLocation/{locationId}")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetBookingsByLocation(int locationId)
        {
            var bookings = await _context.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                .Include(b => b.Approver)
                .Where(b => b.LocationID == locationId)
                .Select(b => new BookingDto
                {
                    BookingID = b.BookingID,
                    CreatedBy = b.CreatedBy,
                    CreatorName = $"{b.Creator.FirstName} {b.Creator.LastName}",
                    LocationID = b.LocationID,
                    LocationName = b.Location.LocationName,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    CreatedAt = b.CreatedAt,
                    ApprovedBy = b.ApprovedBy,
                    ApproverName = b.Approver != null ? $"{b.Approver.FirstName} {b.Approver.LastName}" : null,
                    ApprovedDateTime = b.ApprovedDateTime
                })
                .ToListAsync();

            return Ok(bookings);
        }

        // GET: api/Bookings/pending
        [HttpGet("pending")]
        public async Task<ActionResult<IEnumerable<BookingDto>>> GetPendingBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Creator)
                .Include(b => b.Location)
                .Where(b => b.Status == "pending")
                .Select(b => new BookingDto
                {
                    BookingID = b.BookingID,
                    CreatedBy = b.CreatedBy,
                    CreatorName = $"{b.Creator.FirstName} {b.Creator.LastName}",
                    LocationID = b.LocationID,
                    LocationName = b.Location.LocationName,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    CreatedAt = b.CreatedAt,
                    ApprovedBy = b.ApprovedBy,
                    ApproverName = null,
                    ApprovedDateTime = b.ApprovedDateTime
                })
                .ToListAsync();

            return Ok(bookings);
        }

        private bool BookingExists(int id)
        {
            return _context.Bookings.Any(e => e.BookingID == id);
        }
    }
}