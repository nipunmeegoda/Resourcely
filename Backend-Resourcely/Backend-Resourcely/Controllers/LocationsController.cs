using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LocationsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public LocationsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Locations
        [HttpGet]
        public async Task<ActionResult<IEnumerable<LocationHierarchyDto>>> GetLocations()
        {
            var locations = await _context.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b.Floor)
                        .ThenInclude(f => f.Building)
                .Select(l => new LocationHierarchyDto
                {
                    LocationID = l.LocationID,
                    LocationName = l.LocationName,
                    LocationType = l.LocationType,
                    Capacity = l.Capacity,
                    BlockID = l.BlockID,
                    BlockName = l.Block.BlockName,
                    FloorID = l.Block.FloorID,
                    FloorName = l.Block.Floor.FloorName,
                    FloorNumber = l.Block.Floor.FloorNumber,
                    BuildingID = l.Block.Floor.BuildingID,
                    BuildingName = l.Block.Floor.Building.BuildingName
                })
                .ToListAsync();

            return Ok(locations);
        }

        // GET: api/Locations/5
        [HttpGet("{id}")]
        public async Task<ActionResult<LocationHierarchyDto>> GetLocation(int id)
        {
            var location = await _context.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b.Floor)
                        .ThenInclude(f => f.Building)
                .Where(l => l.LocationID == id)
                .Select(l => new LocationHierarchyDto
                {
                    LocationID = l.LocationID,
                    LocationName = l.LocationName,
                    LocationType = l.LocationType,
                    Capacity = l.Capacity,
                    BlockID = l.BlockID,
                    BlockName = l.Block.BlockName,
                    FloorID = l.Block.FloorID,
                    FloorName = l.Block.Floor.FloorName,
                    FloorNumber = l.Block.Floor.FloorNumber,
                    BuildingID = l.Block.Floor.BuildingID,
                    BuildingName = l.Block.Floor.Building.BuildingName
                })
                .FirstOrDefaultAsync();

            if (location == null)
            {
                return NotFound();
            }

            return Ok(location);
        }

        // GET: api/Locations/byBlock/5
        [HttpGet("byBlock/{blockId}")]
        public async Task<ActionResult<IEnumerable<LocationHierarchyDto>>> GetLocationsByBlock(int blockId)
        {
            var locations = await _context.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b.Floor)
                        .ThenInclude(f => f.Building)
                .Where(l => l.BlockID == blockId)
                .Select(l => new LocationHierarchyDto
                {
                    LocationID = l.LocationID,
                    LocationName = l.LocationName,
                    LocationType = l.LocationType,
                    Capacity = l.Capacity,
                    BlockID = l.BlockID,
                    BlockName = l.Block.BlockName,
                    FloorID = l.Block.FloorID,
                    FloorName = l.Block.Floor.FloorName,
                    FloorNumber = l.Block.Floor.FloorNumber,
                    BuildingID = l.Block.Floor.BuildingID,
                    BuildingName = l.Block.Floor.Building.BuildingName
                })
                .ToListAsync();

            return Ok(locations);
        }

        // GET: api/Locations/byHierarchy
        [HttpGet("byHierarchy")]
        public async Task<ActionResult<IEnumerable<LocationHierarchyDto>>> GetLocationsByHierarchy(
            [FromQuery] int? buildingId = null,
            [FromQuery] int? floorId = null,
            [FromQuery] int? blockId = null,
            [FromQuery] string? locationType = null)
        {
            var query = _context.Locations
                .Include(l => l.Block)
                    .ThenInclude(b => b.Floor)
                        .ThenInclude(f => f.Building)
                .AsQueryable();

            if (buildingId.HasValue)
            {
                query = query.Where(l => l.Block.Floor.BuildingID == buildingId.Value);
            }

            if (floorId.HasValue)
            {
                query = query.Where(l => l.Block.FloorID == floorId.Value);
            }

            if (blockId.HasValue)
            {
                query = query.Where(l => l.BlockID == blockId.Value);
            }

            if (!string.IsNullOrEmpty(locationType))
            {
                query = query.Where(l => l.LocationType == locationType);
            }

            var locations = await query
                .Select(l => new LocationHierarchyDto
                {
                    LocationID = l.LocationID,
                    LocationName = l.LocationName,
                    LocationType = l.LocationType,
                    Capacity = l.Capacity,
                    BlockID = l.BlockID,
                    BlockName = l.Block.BlockName,
                    FloorID = l.Block.FloorID,
                    FloorName = l.Block.Floor.FloorName,
                    FloorNumber = l.Block.Floor.FloorNumber,
                    BuildingID = l.Block.Floor.BuildingID,
                    BuildingName = l.Block.Floor.Building.BuildingName
                })
                .ToListAsync();

            return Ok(locations);
        }

        // POST: api/Locations
        [HttpPost]
        public async Task<ActionResult<LocationDto>> CreateLocation(CreateLocationDto createLocationDto)
        {
            // Check if block exists
            var block = await _context.Blocks.FindAsync(createLocationDto.BlockID);
            if (block == null)
            {
                return BadRequest("Block not found.");
            }

            var location = new Location
            {
                LocationName = createLocationDto.LocationName,
                LocationType = createLocationDto.LocationType,
                Description = createLocationDto.Description,
                Capacity = createLocationDto.Capacity,
                BlockID = createLocationDto.BlockID,
                CreatedAt = DateTime.UtcNow
            };

            _context.Locations.Add(location);
            await _context.SaveChangesAsync();

            var locationDto = new LocationDto
            {
                LocationID = location.LocationID,
                LocationName = location.LocationName,
                LocationType = location.LocationType,
                Description = location.Description,
                Capacity = location.Capacity,
                BlockID = location.BlockID,
                BlockName = block.BlockName,
                CreatedAt = location.CreatedAt
            };

            return CreatedAtAction(nameof(GetLocation), new { id = location.LocationID }, locationDto);
        }

        // PUT: api/Locations/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateLocation(int id, UpdateLocationDto updateLocationDto)
        {
            var location = await _context.Locations.FindAsync(id);

            if (location == null)
            {
                return NotFound();
            }

            location.LocationName = updateLocationDto.LocationName;
            location.LocationType = updateLocationDto.LocationType;
            location.Description = updateLocationDto.Description;
            location.Capacity = updateLocationDto.Capacity;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!LocationExists(id))
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

        // DELETE: api/Locations/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteLocation(int id)
        {
            var location = await _context.Locations.FindAsync(id);
            if (location == null)
            {
                return NotFound();
            }

            _context.Locations.Remove(location);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool LocationExists(int id)
        {
            return _context.Locations.Any(e => e.LocationID == id);
        }
    }
}