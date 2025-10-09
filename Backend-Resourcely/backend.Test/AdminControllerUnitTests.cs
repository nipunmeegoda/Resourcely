using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Controllers;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;

namespace backend.Test
{
    public class AdminControllerUnitTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly AdminController _controller;
        private readonly DbContextOptions<AppDbContext> _options;

        public AdminControllerUnitTests()
        {
            _options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(_options);
            _controller = new AdminController(_context);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            // Add test building
            var building = new Building
            {
                Id = 1,
                Name = "Test Building",
                Description = "A test building",
                CreatedAt = DateTime.UtcNow
            };

            var floor = new Floor
            {
                Id = 1,
                Name = "Ground Floor",
                FloorNumber = 0,
                BuildingId = 1,
                Building = building
            };

            var block = new Block
            {
                Id = 1,
                Name = "Block A",
                FloorId = 1,
                Floor = floor
            };

            var resource = new Resource
            {
                Id = 1,
                Name = "Test Room",
                Type = "Meeting Room",
                Description = "A test meeting room",
                Capacity = 10,
                BlockId = 1,
                Block = block,
                IsActive = true,
                IsRestricted = false
            };

            _context.Buildings.Add(building);
            _context.Floors.Add(floor);
            _context.Blocks.Add(block);
            _context.Resources.Add(resource);
            _context.SaveChanges();
        }

        [Fact]
        public async Task CreateBuilding_ShouldCreateNewBuilding()
        {
            // Arrange
            var request = new Backend_Resourcely.Controllers.AdminController.CreateBuildingRequest
            {
                Name = "New Building",
                Description = "A new test building"
            };

            // Act
            var result = await _controller.CreateBuilding(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);

            // Verify building was created in database
            var building = await _context.Buildings
                .FirstOrDefaultAsync(b => b.Name == "New Building");
            Assert.NotNull(building);
            Assert.Equal("A new test building", building.Description);
        }

        [Fact]
        public async Task CreateBuilding_ShouldReturnBadRequestForEmptyName()
        {
            // Arrange
            var request = new Backend_Resourcely.Controllers.AdminController.CreateBuildingRequest
            {
                Name = "",
                Description = "Building with empty name"
            };

            // Act
            var result = await _controller.CreateBuilding(request);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);
        }

        [Fact]
        public async Task CreateFloor_ShouldCreateNewFloor()
        {
            // Arrange
            var request = new Backend_Resourcely.Controllers.AdminController.CreateFloorRequest
            {
                Name = "First Floor",
                Description = "First floor description",
                BuildingId = 1
            };

            // Act
            var result = await _controller.CreateFloor(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);

            // Verify floor was created in database
            var floor = await _context.Floors
                .FirstOrDefaultAsync(f => f.Name == "First Floor");
            Assert.NotNull(floor);
            Assert.Equal(1, floor.BuildingId);
        }

        [Fact]
        public async Task CreateBlock_ShouldCreateNewBlock()
        {
            // Arrange
            var request = new Backend_Resourcely.Controllers.AdminController.CreateBlockRequest
            {
                Name = "Block B",
                Description = "Block B description",
                FloorId = 1
            };

            // Act
            var result = await _controller.CreateBlock(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);

            // Verify block was created in database
            var block = await _context.Blocks
                .FirstOrDefaultAsync(b => b.Name == "Block B");
            Assert.NotNull(block);
            Assert.Equal(1, block.FloorId);
        }

        [Fact]
        public async Task CreateResource_ShouldCreateNewResource()
        {
            // Arrange
            var request = new Backend_Resourcely.Controllers.AdminController.CreateResourceRequest
            {
                Name = "New Conference Room",
                Type = "Conference Room",
                Description = "A new conference room",
                Capacity = 20,
                BlockId = 1
            };

            // Act
            var result = await _controller.CreateResource(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);

            // Verify resource was created in database
            var resource = await _context.Resources
                .FirstOrDefaultAsync(r => r.Name == "New Conference Room");
            Assert.NotNull(resource);
            Assert.Equal("Conference Room", resource.Type);
            Assert.Equal(20, resource.Capacity);
        }

        [Fact]
        public async Task GetOverview_ShouldReturnAdminOverview()
        {
            // Act
            var result = await _controller.GetOverview();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }


}