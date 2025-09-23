using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AvailabilityController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AvailabilityController(ApplicationDbContext context)
        {
            _context = context;
        }

        // POST: api/Availability/check
        [HttpPost("check")]
        public async Task<ActionResult<AvailabilityResponseDto>> CheckAvailability(AvailabilityCheckDto checkDto)
        {
            var location = await _context.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b.Floor)
                        .ThenInclude(f => f.Building)
                .FirstOrDefaultAsync(l => l.LocationID == checkDto.LocationID);

            if (location == null)
            {
                return NotFound("Location not found.");
            }

            // Check for conflicting bookings (approved or pending bookings that overlap)
            var conflictingBookings = await _context.Bookings
                .Include(b => b.Creator)
                .Where(b => b.LocationID == checkDto.LocationID &&
                           b.Status != "rejected" &&
                           b.Status != "cancelled" &&
                           ((b.StartsAt < checkDto.EndDateTime && b.EndsAt > checkDto.StartDateTime)))
                .Select(b => new ConflictingBookingDto
                {
                    BookingID = b.BookingID,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose
                })
                .ToListAsync();

            var isAvailable = !conflictingBookings.Any();

            // If there are conflicts, calculate available slots around them
            var availableSlots = new List<AvailableSlotDto>();
            if (!isAvailable)
            {
                // Sort conflicts by start time
                var sortedConflicts = conflictingBookings.OrderBy(b => b.StartsAt).ToList();
                
                // Check if there's availability before the first conflict
                if (sortedConflicts.First().StartsAt > checkDto.StartDateTime)
                {
                    availableSlots.Add(new AvailableSlotDto
                    {
                        StartTime = checkDto.StartDateTime,
                        EndTime = sortedConflicts.First().StartsAt
                    });
                }

                // Check for gaps between conflicts
                for (int i = 0; i < sortedConflicts.Count - 1; i++)
                {
                    if (sortedConflicts[i].EndsAt < sortedConflicts[i + 1].StartsAt)
                    {
                        availableSlots.Add(new AvailableSlotDto
                        {
                            StartTime = sortedConflicts[i].EndsAt,
                            EndTime = sortedConflicts[i + 1].StartsAt
                        });
                    }
                }

                // Check if there's availability after the last conflict
                if (sortedConflicts.Last().EndsAt < checkDto.EndDateTime)
                {
                    availableSlots.Add(new AvailableSlotDto
                    {
                        StartTime = sortedConflicts.Last().EndsAt,
                        EndTime = checkDto.EndDateTime
                    });
                }
            }
            else
            {
                // Entire requested time slot is available
                availableSlots.Add(new AvailableSlotDto
                {
                    StartTime = checkDto.StartDateTime,
                    EndTime = checkDto.EndDateTime
                });
            }

            var response = new AvailabilityResponseDto
            {
                LocationID = checkDto.LocationID,
                LocationName = location.LocationName,
                IsAvailable = isAvailable,
                ConflictingBookings = conflictingBookings,
                AvailableSlots = availableSlots
            };

            return Ok(response);
        }

        // GET: api/Availability/{locationId}/slots
        [HttpGet("{locationId}/slots")]
        public async Task<ActionResult<IEnumerable<AvailableSlotDto>>> GetAvailableSlots(
            int locationId,
            [FromQuery] DateTime date)
        {
            var location = await _context.Locations.FindAsync(locationId);
            if (location == null)
            {
                return NotFound("Location not found.");
            }

            var startOfDay = date.Date;
            var endOfDay = date.Date.AddDays(1).AddTicks(-1);

            // Get all bookings for the day
            var dayBookings = await _context.Bookings
                .Where(b => b.LocationID == locationId &&
                           b.Status != "rejected" &&
                           b.Status != "cancelled" &&
                           b.StartsAt.Date == date.Date)
                .OrderBy(b => b.StartsAt)
                .Select(b => new ConflictingBookingDto
                {
                    BookingID = b.BookingID,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose
                })
                .ToListAsync();

            var availableSlots = new List<AvailableSlotDto>();
            
            // Assume standard business hours: 8 AM to 6 PM
            var businessStart = startOfDay.AddHours(8);
            var businessEnd = startOfDay.AddHours(18);

            if (!dayBookings.Any())
            {
                // Entire business day is available
                availableSlots.Add(new AvailableSlotDto
                {
                    StartTime = businessStart,
                    EndTime = businessEnd
                });
            }
            else
            {
                // Check availability before first booking
                if (dayBookings.First().StartsAt > businessStart)
                {
                    availableSlots.Add(new AvailableSlotDto
                    {
                        StartTime = businessStart,
                        EndTime = dayBookings.First().StartsAt
                    });
                }

                // Check gaps between bookings
                for (int i = 0; i < dayBookings.Count - 1; i++)
                {
                    if (dayBookings[i].EndsAt < dayBookings[i + 1].StartsAt)
                    {
                        availableSlots.Add(new AvailableSlotDto
                        {
                            StartTime = dayBookings[i].EndsAt,
                            EndTime = dayBookings[i + 1].StartsAt
                        });
                    }
                }

                // Check availability after last booking
                if (dayBookings.Last().EndsAt < businessEnd)
                {
                    availableSlots.Add(new AvailableSlotDto
                    {
                        StartTime = dayBookings.Last().EndsAt,
                        EndTime = businessEnd
                    });
                }
            }

            return Ok(availableSlots);
        }

        // GET: api/Availability/{locationId}/day-overview
        [HttpGet("{locationId}/day-overview")]
        public async Task<ActionResult<object>> GetDayOverview(int locationId, [FromQuery] DateTime date)
        {
            var location = await _context.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b.Floor)
                        .ThenInclude(f => f.Building)
                .FirstOrDefaultAsync(l => l.LocationID == locationId);

            if (location == null)
            {
                return NotFound("Location not found.");
            }

            var dayBookings = await _context.Bookings
                .Include(b => b.Creator)
                .Where(b => b.LocationID == locationId &&
                           b.Status != "rejected" &&
                           b.Status != "cancelled" &&
                           b.StartsAt.Date == date.Date)
                .OrderBy(b => b.StartsAt)
                .Select(b => new BookingDto
                {
                    BookingID = b.BookingID,
                    CreatedBy = b.CreatedBy,
                    CreatorName = $"{b.Creator.FirstName} {b.Creator.LastName}",
                    LocationID = b.LocationID,
                    LocationName = location.LocationName,
                    StartsAt = b.StartsAt,
                    EndsAt = b.EndsAt,
                    Status = b.Status,
                    Purpose = b.Purpose,
                    CreatedAt = b.CreatedAt,
                    ApprovedBy = b.ApprovedBy,
                    ApprovedDateTime = b.ApprovedDateTime
                })
                .ToListAsync();

            var availableSlotsResult = await GetAvailableSlots(locationId, date);
            var availableSlots = ((OkObjectResult)availableSlotsResult.Result!).Value;

            var response = new
            {
                Location = new LocationHierarchyDto
                {
                    LocationID = location.LocationID,
                    LocationName = location.LocationName,
                    LocationType = location.LocationType,
                    Capacity = location.Capacity,
                    BlockID = location.BlockID,
                    BlockName = location.Block.BlockName,
                    FloorID = location.Block.FloorID,
                    FloorName = location.Block.Floor.FloorName,
                    FloorNumber = location.Block.Floor.FloorNumber,
                    BuildingID = location.Block.Floor.BuildingID,
                    BuildingName = location.Block.Floor.Building.BuildingName
                },
                Date = date.Date,
                Bookings = dayBookings,
                AvailableSlots = availableSlots
            };

            return Ok(response);
        }
    }
}