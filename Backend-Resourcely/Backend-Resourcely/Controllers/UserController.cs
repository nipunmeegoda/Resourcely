using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UserController(AppDbContext db)
        {
            _db = db;
        }

        // GET: api/user/stats
        [HttpGet("stats")]
        public async Task<ActionResult<object>> GetUserStats()
        {
            try
            {
                var now = DateTime.UtcNow;
                var today = now.Date;

                // For now, we'll get general stats since we don't have user authentication
                // In a real app, you'd get the current user ID from authentication
                
                var totalBookings = await _db.Bookings.CountAsync();
                var upcomingBookings = await _db.Bookings
                    .CountAsync(b => b.BookingAt > now && b.Status == "Approved");
                var totalResources = await _db.Resources
                    .CountAsync(r => r.IsActive);
                var availableToday = await _db.Resources
                    .Where(r => r.IsActive)
                    .CountAsync(r => !_db.Bookings.Any(b => 
                        b.ResourceId == r.Id && 
                        b.Status == "Approved" && 
                        b.BookingAt.Date == today &&
                        b.BookingAt <= now &&
                        b.EndAt > now));

                var stats = new
                {
                    upcomingBookings,
                    totalBookings,
                    availableRooms = availableToday,
                    favoriteRooms = 0 // Placeholder - would need favorites feature
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load user stats", error = ex.Message });
            }
        }

        // GET: api/user/bookings/recent
        [HttpGet("bookings/recent")]
        public async Task<ActionResult<IEnumerable<object>>> GetRecentBookings()
        {
            try
            {
                // For demo purposes, get recent bookings for all users
                // In a real app, filter by current user ID
                var recentBookings = await _db.Bookings
                    .Include(b => b.Resource)
                    .ThenInclude(r => r.Block)
                    .ThenInclude(bl => bl.Floor)
                    .ThenInclude(f => f.Building)
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(5)
                    .Select(b => new
                    {
                        id = b.Id.ToString(),
                        roomName = b.Resource.Name,
                        date = b.BookingAt.ToString("yyyy-MM-dd"),
                        time = $"{b.BookingAt:HH:mm} - {b.EndAt:HH:mm}",
                        status = b.Status == "Approved" ? "confirmed" : 
                                b.Status == "Rejected" ? "cancelled" : "pending",
                        location = $"{b.Resource.Block.Floor.Building.Name} > {b.Resource.Block.Floor.Name} > {b.Resource.Block.Name}",
                        b.Reason,
                        b.Capacity,
                        b.Contact
                    })
                    .ToListAsync();

                return Ok(recentBookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to load recent bookings", error = ex.Message });
            }
        }
    }
}