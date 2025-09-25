using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FloorsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FloorsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Floors
        [HttpGet]
        public async Task<ActionResult<IEnumerable<FloorDto>>> GetFloors()
        {
            var floors = await _context.Floors
                .Include(f => f.Building)
                .Include(f => f.Blocks)
                    .ThenInclude(b => b.Locations)
                .Select(f => new FloorDto
                {
                    FloorID = f.FloorID,
                    FloorName = f.FloorName,
                    FloorNumber = f.FloorNumber,
                    Description = f.Description,
                    BuildingID = f.BuildingID,
                    BuildingName = f.Building.BuildingName,
                    CreatedAt = f.CreatedAt,
                    Blocks = f.Blocks.Select(b => new BlockDto
                    {
                        BlockID = b.BlockID,
                        BlockName = b.BlockName,
                        Description = b.Description,
                        FloorID = b.FloorID,
                        FloorName = f.FloorName,
                        CreatedAt = b.CreatedAt,
                        Locations = b.Locations.Select(l => new LocationDto
                        {
                            LocationID = l.LocationID,
                            LocationName = l.LocationName,
                            LocationType = l.LocationType,
                            Description = l.Description,
                            Capacity = l.Capacity,
                            BlockID = l.BlockID,
                            BlockName = b.BlockName,
                            CreatedAt = l.CreatedAt
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(floors);
        }

        // GET: api/Floors/5
        [HttpGet("{id}")]
        public async Task<ActionResult<FloorDto>> GetFloor(int id)
        {
            var floor = await _context.Floors
                .Include(f => f.Building)
                .Include(f => f.Blocks)
                    .ThenInclude(b => b.Locations)
                .Where(f => f.FloorID == id)
                .Select(f => new FloorDto
                {
                    FloorID = f.FloorID,
                    FloorName = f.FloorName,
                    FloorNumber = f.FloorNumber,
                    Description = f.Description,
                    BuildingID = f.BuildingID,
                    BuildingName = f.Building.BuildingName,
                    CreatedAt = f.CreatedAt,
                    Blocks = f.Blocks.Select(b => new BlockDto
                    {
                        BlockID = b.BlockID,
                        BlockName = b.BlockName,
                        Description = b.Description,
                        FloorID = b.FloorID,
                        FloorName = f.FloorName,
                        CreatedAt = b.CreatedAt,
                        Locations = b.Locations.Select(l => new LocationDto
                        {
                            LocationID = l.LocationID,
                            LocationName = l.LocationName,
                            LocationType = l.LocationType,
                            Description = l.Description,
                            Capacity = l.Capacity,
                            BlockID = l.BlockID,
                            BlockName = b.BlockName,
                            CreatedAt = l.CreatedAt
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (floor == null)
            {
                return NotFound();
            }

            return Ok(floor);
        }

        // GET: api/Floors/byBuilding/5
        [HttpGet("byBuilding/{buildingId}")]
        public async Task<ActionResult<IEnumerable<FloorDto>>> GetFloorsByBuilding(int buildingId)
        {
            var floors = await _context.Floors
                .Include(f => f.Building)
                .Include(f => f.Blocks)
                    .ThenInclude(b => b.Locations)
                .Where(f => f.BuildingID == buildingId)
                .Select(f => new FloorDto
                {
                    FloorID = f.FloorID,
                    FloorName = f.FloorName,
                    FloorNumber = f.FloorNumber,
                    Description = f.Description,
                    BuildingID = f.BuildingID,
                    BuildingName = f.Building.BuildingName,
                    CreatedAt = f.CreatedAt,
                    Blocks = f.Blocks.Select(b => new BlockDto
                    {
                        BlockID = b.BlockID,
                        BlockName = b.BlockName,
                        Description = b.Description,
                        FloorID = b.FloorID,
                        FloorName = f.FloorName,
                        CreatedAt = b.CreatedAt,
                        Locations = b.Locations.Select(l => new LocationDto
                        {
                            LocationID = l.LocationID,
                            LocationName = l.LocationName,
                            LocationType = l.LocationType,
                            Description = l.Description,
                            Capacity = l.Capacity,
                            BlockID = l.BlockID,
                            BlockName = b.BlockName,
                            CreatedAt = l.CreatedAt
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(floors);
        }

        // POST: api/Floors
        [HttpPost]
        public async Task<ActionResult<FloorDto>> CreateFloor(CreateFloorDto createFloorDto)
        {
            // Check if building exists
            var building = await _context.Buildings.FindAsync(createFloorDto.BuildingID);
            if (building == null)
            {
                return BadRequest("Building not found.");
            }

            var floor = new Floor
            {
                FloorName = createFloorDto.FloorName,
                FloorNumber = createFloorDto.FloorNumber,
                Description = createFloorDto.Description,
                BuildingID = createFloorDto.BuildingID,
                CreatedAt = DateTime.UtcNow
            };

            _context.Floors.Add(floor);
            await _context.SaveChangesAsync();

            var floorDto = new FloorDto
            {
                FloorID = floor.FloorID,
                FloorName = floor.FloorName,
                FloorNumber = floor.FloorNumber,
                Description = floor.Description,
                BuildingID = floor.BuildingID,
                BuildingName = building.BuildingName,
                CreatedAt = floor.CreatedAt,
                Blocks = new List<BlockDto>()
            };

            return CreatedAtAction(nameof(GetFloor), new { id = floor.FloorID }, floorDto);
        }

        // PUT: api/Floors/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFloor(int id, UpdateFloorDto updateFloorDto)
        {
            var floor = await _context.Floors.FindAsync(id);

            if (floor == null)
            {
                return NotFound();
            }

            floor.FloorName = updateFloorDto.FloorName;
            floor.FloorNumber = updateFloorDto.FloorNumber;
            floor.Description = updateFloorDto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!FloorExists(id))
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

        // DELETE: api/Floors/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFloor(int id)
        {
            var floor = await _context.Floors.FindAsync(id);
            if (floor == null)
            {
                return NotFound();
            }

            _context.Floors.Remove(floor);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool FloorExists(int id)
        {
            return _context.Floors.Any(e => e.FloorID == id);
        }
    }
}