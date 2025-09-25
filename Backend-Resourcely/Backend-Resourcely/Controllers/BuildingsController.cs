using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BuildingsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BuildingsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Buildings
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BuildingDto>>> GetBuildings()
        {
            var buildings = await _context.Buildings
                .Include(b => b.Floors)
                    .ThenInclude(f => f.Blocks)
                        .ThenInclude(bl => bl.Locations)
                .Select(b => new BuildingDto
                {
                    BuildingID = b.BuildingID,
                    BuildingName = b.BuildingName,
                    Description = b.Description,
                    CreatedAt = b.CreatedAt,
                    Floors = b.Floors.Select(f => new FloorDto
                    {
                        FloorID = f.FloorID,
                        FloorName = f.FloorName,
                        FloorNumber = f.FloorNumber,
                        Description = f.Description,
                        BuildingID = f.BuildingID,
                        BuildingName = b.BuildingName,
                        CreatedAt = f.CreatedAt,
                        Blocks = f.Blocks.Select(bl => new BlockDto
                        {
                            BlockID = bl.BlockID,
                            BlockName = bl.BlockName,
                            Description = bl.Description,
                            FloorID = bl.FloorID,
                            FloorName = f.FloorName,
                            CreatedAt = bl.CreatedAt,
                            Locations = bl.Locations.Select(l => new LocationDto
                            {
                                LocationID = l.LocationID,
                                LocationName = l.LocationName,
                                LocationType = l.LocationType,
                                Description = l.Description,
                                Capacity = l.Capacity,
                                BlockID = l.BlockID,
                                BlockName = bl.BlockName,
                                CreatedAt = l.CreatedAt
                            }).ToList()
                        }).ToList()
                    }).ToList()
                })
                .ToListAsync();

            return Ok(buildings);
        }

        // GET: api/Buildings/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BuildingDto>> GetBuilding(int id)
        {
            var building = await _context.Buildings
                .Include(b => b.Floors)
                    .ThenInclude(f => f.Blocks)
                        .ThenInclude(bl => bl.Locations)
                .Where(b => b.BuildingID == id)
                .Select(b => new BuildingDto
                {
                    BuildingID = b.BuildingID,
                    BuildingName = b.BuildingName,
                    Description = b.Description,
                    CreatedAt = b.CreatedAt,
                    Floors = b.Floors.Select(f => new FloorDto
                    {
                        FloorID = f.FloorID,
                        FloorName = f.FloorName,
                        FloorNumber = f.FloorNumber,
                        Description = f.Description,
                        BuildingID = f.BuildingID,
                        BuildingName = b.BuildingName,
                        CreatedAt = f.CreatedAt,
                        Blocks = f.Blocks.Select(bl => new BlockDto
                        {
                            BlockID = bl.BlockID,
                            BlockName = bl.BlockName,
                            Description = bl.Description,
                            FloorID = bl.FloorID,
                            FloorName = f.FloorName,
                            CreatedAt = bl.CreatedAt,
                            Locations = bl.Locations.Select(l => new LocationDto
                            {
                                LocationID = l.LocationID,
                                LocationName = l.LocationName,
                                LocationType = l.LocationType,
                                Description = l.Description,
                                Capacity = l.Capacity,
                                BlockID = l.BlockID,
                                BlockName = bl.BlockName,
                                CreatedAt = l.CreatedAt
                            }).ToList()
                        }).ToList()
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (building == null)
            {
                return NotFound();
            }

            return Ok(building);
        }

        // POST: api/Buildings
        [HttpPost]
        public async Task<ActionResult<BuildingDto>> CreateBuilding(CreateBuildingDto createBuildingDto)
        {
            var building = new Building
            {
                BuildingName = createBuildingDto.BuildingName,
                Description = createBuildingDto.Description,
                CreatedAt = DateTime.UtcNow
            };

            _context.Buildings.Add(building);
            await _context.SaveChangesAsync();

            var buildingDto = new BuildingDto
            {
                BuildingID = building.BuildingID,
                BuildingName = building.BuildingName,
                Description = building.Description,
                CreatedAt = building.CreatedAt,
                Floors = new List<FloorDto>()
            };

            return CreatedAtAction(nameof(GetBuilding), new { id = building.BuildingID }, buildingDto);
        }

        // PUT: api/Buildings/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBuilding(int id, UpdateBuildingDto updateBuildingDto)
        {
            var building = await _context.Buildings.FindAsync(id);

            if (building == null)
            {
                return NotFound();
            }

            building.BuildingName = updateBuildingDto.BuildingName;
            building.Description = updateBuildingDto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BuildingExists(id))
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

        // DELETE: api/Buildings/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBuilding(int id)
        {
            var building = await _context.Buildings.FindAsync(id);
            if (building == null)
            {
                return NotFound();
            }

            _context.Buildings.Remove(building);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BuildingExists(int id)
        {
            return _context.Buildings.Any(e => e.BuildingID == id);
        }
    }
}