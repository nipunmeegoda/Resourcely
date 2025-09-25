using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.DTOs;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BlocksController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public BlocksController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/Blocks
        [HttpGet]
        public async Task<ActionResult<IEnumerable<BlockDto>>> GetBlocks()
        {
            var blocks = await _context.Blocks
                .Include(b => b.Floor)
                .Include(b => b.Locations)
                .Select(b => new BlockDto
                {
                    BlockID = b.BlockID,
                    BlockName = b.BlockName,
                    Description = b.Description,
                    FloorID = b.FloorID,
                    FloorName = b.Floor.FloorName,
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
                })
                .ToListAsync();

            return Ok(blocks);
        }

        // GET: api/Blocks/5
        [HttpGet("{id}")]
        public async Task<ActionResult<BlockDto>> GetBlock(int id)
        {
            var block = await _context.Blocks
                .Include(b => b.Floor)
                .Include(b => b.Locations)
                .Where(b => b.BlockID == id)
                .Select(b => new BlockDto
                {
                    BlockID = b.BlockID,
                    BlockName = b.BlockName,
                    Description = b.Description,
                    FloorID = b.FloorID,
                    FloorName = b.Floor.FloorName,
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
                })
                .FirstOrDefaultAsync();

            if (block == null)
            {
                return NotFound();
            }

            return Ok(block);
        }

        // GET: api/Blocks/byFloor/5
        [HttpGet("byFloor/{floorId}")]
        public async Task<ActionResult<IEnumerable<BlockDto>>> GetBlocksByFloor(int floorId)
        {
            var blocks = await _context.Blocks
                .Include(b => b.Floor)
                .Include(b => b.Locations)
                .Where(b => b.FloorID == floorId)
                .Select(b => new BlockDto
                {
                    BlockID = b.BlockID,
                    BlockName = b.BlockName,
                    Description = b.Description,
                    FloorID = b.FloorID,
                    FloorName = b.Floor.FloorName,
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
                })
                .ToListAsync();

            return Ok(blocks);
        }

        // POST: api/Blocks
        [HttpPost]
        public async Task<ActionResult<BlockDto>> CreateBlock(CreateBlockDto createBlockDto)
        {
            // Check if floor exists
            var floor = await _context.Floors.FindAsync(createBlockDto.FloorID);
            if (floor == null)
            {
                return BadRequest("Floor not found.");
            }

            var block = new Block
            {
                BlockName = createBlockDto.BlockName,
                Description = createBlockDto.Description,
                FloorID = createBlockDto.FloorID,
                CreatedAt = DateTime.UtcNow
            };

            _context.Blocks.Add(block);
            await _context.SaveChangesAsync();

            var blockDto = new BlockDto
            {
                BlockID = block.BlockID,
                BlockName = block.BlockName,
                Description = block.Description,
                FloorID = block.FloorID,
                FloorName = floor.FloorName,
                CreatedAt = block.CreatedAt,
                Locations = new List<LocationDto>()
            };

            return CreatedAtAction(nameof(GetBlock), new { id = block.BlockID }, blockDto);
        }

        // PUT: api/Blocks/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBlock(int id, UpdateBlockDto updateBlockDto)
        {
            var block = await _context.Blocks.FindAsync(id);

            if (block == null)
            {
                return NotFound();
            }

            block.BlockName = updateBlockDto.BlockName;
            block.Description = updateBlockDto.Description;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!BlockExists(id))
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

        // DELETE: api/Blocks/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBlock(int id)
        {
            var block = await _context.Blocks.FindAsync(id);
            if (block == null)
            {
                return NotFound();
            }

            _context.Blocks.Remove(block);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        private bool BlockExists(int id)
        {
            return _context.Blocks.Any(e => e.BlockID == id);
        }
    }
}