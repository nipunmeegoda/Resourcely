using System.Globalization;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization; // auth
using Microsoft.AspNetCore.Identity;    //auth

namespace Backend_Resourcely.Controllers
{
    [Authorize(Roles = "User,Manager,Admin")]

    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;   ////????

        public BookingsController(AppDbContext db , UserManager<ApplicationUser> userManager)  //?     
        {
            _db = db;
            _userManager = userManager; // Initialize UserManager
        }

        public class BookingCreateDto
        {
            public string Location { get; set; } = string.Empty;
            public string Date { get; set; } = string.Empty; // "YYYY-MM-DD"
            public string Time { get; set; } = string.Empty; // "HH:mm"
            public string Reason { get; set; } = string.Empty;
            public int Capacity { get; set; }
            public string Contact { get; set; } = string.Empty;
           //  public int? UserId { get; set; }   removed this becouse the userauth provids one no need for duplicates 
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

             // Get the currently logged-in user's ID 
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
            {
                return Unauthorized(new { message = "User not found" });
            }

           // var userId = dto.UserId ?? 1;
            var userId = currentUser.Id; // Use the authenticated user's ID no need for duplicates 

            var booking = new Booking
            {
                UserId = userId, // Use the ID  from authentication
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


         // Optional: Check if user owns this booking or is admin
            var currentUser = await _userManager.GetUserAsync(User);
            var isAdmin = await _userManager.IsInRoleAsync(currentUser, "Admin");
            
            if (booking.UserId != currentUser.Id && !isAdmin)
            {
                return Forbid(); // User can only access their own bookings unless admin For sefty and securty 
            }

            return Ok(booking);
        }

        [HttpGet("my-bookings")]
        public async Task<ActionResult<List<Booking>>> GetMyBookings()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            var bookings = await _db.Bookings
                .Where(b => b.UserId == currentUser.Id)
                .AsNoTracking()
                .ToListAsync();

            return Ok(bookings);
        }






        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == id);
            if (booking is null)
            {
                return NotFound();
            }

             // Check if user owns this booking or is admin
            var currentUser = await _userManager.GetUserAsync(User);
            var isAdmin = await _userManager.IsInRoleAsync(currentUser, "Admin");
            
            if (booking.UserId != currentUser.Id && !isAdmin)
            {
                return Forbid(); // User can only delete their own bookings unless admin
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

         // Admin-only endpoint to get all bookings
        [Authorize(Roles = "Admin,Manager")] // More restrictive role requirement
        [HttpGet("all")]
        public async Task<ActionResult<List<Booking>>> GetAllBookings()
        {
            var bookings = await _db.Bookings.AsNoTracking().ToListAsync();
            return Ok(bookings);
        }

    }
} 