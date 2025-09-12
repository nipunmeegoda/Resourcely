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
            public string Location { get; set; } = string.Empty;
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

            var booking = new Booking
            {
                UserId = userId,
                Location = dto.Location.Trim(),
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