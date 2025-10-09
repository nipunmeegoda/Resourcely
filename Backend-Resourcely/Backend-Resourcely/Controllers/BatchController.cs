using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BatchesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public BatchesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/batches
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Batch>>> GetBatches()
        {
            return await _context.Batches
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();
        }

        // GET: api/batches/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<Batch>> GetBatch(int id)
        {
            var batch = await _context.Batches.FindAsync(id);
            if (batch == null) return NotFound();
            return batch;
        }

        // POST: api/batches
        [HttpPost]
        public async Task<ActionResult<Batch>> CreateBatch([FromBody] BatchCreateDto dto)
        {
            if (await _context.Batches.AnyAsync(b => b.Name == dto.Name))
                return Conflict($"A batch named '{dto.Name}' already exists.");

            var batch = new Batch
            {
                Name = dto.Name,
                Code = dto.Code,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.Batches.Add(batch);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetBatch), new { id = batch.Id }, batch);
        }

        // PUT: api/batches/{id}
        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateBatch(int id, [FromBody] BatchUpdateDto dto)
        {
            var batch = await _context.Batches.FindAsync(id);
            if (batch == null) return NotFound();

            if (dto.Name != null) batch.Name = dto.Name;
            if (dto.Code != null) batch.Code = dto.Code;
            if (dto.StartDate.HasValue) batch.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) batch.EndDate = dto.EndDate;
            if (dto.IsActive.HasValue) batch.IsActive = dto.IsActive.Value;

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/batches/{id}
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteBatch(int id)
        {
            var batch = await _context.Batches.FindAsync(id);
            if (batch == null) return NotFound();

            _context.Batches.Remove(batch);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
