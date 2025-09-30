using System;
using System.Threading.Tasks;
using System.Linq;
using Backend_Resourcely.Controllers;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Xunit;
using static Backend_Resourcely.Controllers.BookingsController;

namespace backend.Test
{
    public class BookingsControllerTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly BookingsController _controller;

        public BookingsControllerTests()
        {
            // Create in-memory database for testing
            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(options);
            _controller = new BookingsController(_context);
        }

        public void Dispose()
        {
            _context.Dispose();
        }

        [Fact]
        public async Task Create_WithValidData_ReturnsCreatedResult()
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = "Conference Room A",
                Date = "2024-12-25",
                Time = "14:30",
                Reason = "Team meeting",
                Capacity = 10,
                Contact = "john.doe@example.com",
                UserId = 5
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            Assert.Equal(nameof(_controller.GetById), createdResult.ActionName);

            // Verify the booking was saved to database
            var savedBooking = await _context.Bookings.FirstAsync();
            Assert.Equal("Conference Room A", savedBooking.Location);
            Assert.Equal("5", savedBooking.UserId.ToString());
            Assert.Equal(new DateTime(2024, 12, 25, 14, 30, 0), savedBooking.BookingAt);
            Assert.Equal("Team meeting", savedBooking.Reason);
            Assert.Equal(10, savedBooking.Capacity);
            Assert.Equal("john.doe@example.com", savedBooking.Contact);
        }

        [Fact]
        public async Task Create_WithNullUserId_DefaultsToUserId1()
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = "Meeting Room B",
                Date = "2024-12-26",
                Time = "10:00",
                Reason = "Project review",
                Capacity = 5,
                Contact = "jane.smith@example.com",
                UserId = null // This should default to 1
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var savedBooking = await _context.Bookings.FirstAsync();
            Assert.Equal(1.ToString(), savedBooking.UserId);
        }

        [Fact]
        //INVALID OUTPUT     ________________________________________________
        public async Task Create_WithEmptyLocation_ReturnsBadRequest()
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = "",
                Date = "2024-12-25",
                Time = "14:30",
                Reason = "Team meeting",
                Capacity = 10,
                Contact = "john.doe@example.com"
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);

            // Use reflection to access anonymous object property
            var messageProperty = badRequestResult.Value.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var messageValue = messageProperty.GetValue(badRequestResult.Value) as string;
            Assert.Equal("Invalid input.", messageValue);
        }

        [Fact]
        //Test validation for invalid Capacity (<=0). ----------------------------------------------------
        public async Task Create_WithInvalidCapacity_ReturnsBadRequest()
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = "Conference Room A",
                Date = "2024-12-25",
                Time = "14:30",
                Reason = "Team meeting",
                Capacity = 0,
                Contact = "john.doe@example.com"
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);

            var messageProperty = badRequestResult.Value.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var messageValue = messageProperty.GetValue(badRequestResult.Value) as string;
            Assert.Equal("Invalid input.", messageValue);
        }

        [Fact]
        //Ensure invalid Date format is rejected. ------------------------ Returns BadRequestObjectResult with "Invalid date/time format.".
        public async Task Create_WithInvalidDateFormat_ReturnsBadRequest()
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = "Conference Room A",
                Date = "invalid-date",
                Time = "14:30",
                Reason = "Team meeting",
                Capacity = 10,
                Contact = "john.doe@example.com"
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            Assert.NotNull(badRequestResult.Value);

            var messageProperty = badRequestResult.Value.GetType().GetProperty("message");
            Assert.NotNull(messageProperty);
            var messageValue = messageProperty.GetValue(badRequestResult.Value) as string;
            Assert.Equal("Invalid date/time format.", messageValue);
        }

        [Fact]
        ///Ensure controller trims leading/trailing whitespace from Location, Reason, Contact. -----------------------------------
        public async Task Create_TrimsWhitespaceFromStringFields()
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = "  Conference Room A  ",
                Date = "2024-12-25",
                Time = "14:30",
                Reason = "  Team meeting  ",
                Capacity = 10,
                Contact = "  john.doe@example.com  "
            };

            // Act
            var result = await _controller.Create(dto);
            //Ensure CreatedAt property is set to current UTC time when booking is created. ------------------------

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result.Result);
            var savedBooking = await _context.Bookings.FirstAsync();

            Assert.Equal("Conference Room A", savedBooking.Location);
            Assert.Equal("Team meeting", savedBooking.Reason);
            Assert.Equal("john.doe@example.com", savedBooking.Contact);
        }

        [Fact]
        ///Check retrieving an existing booking by ID. --------------------------------------------------
        public async Task GetById_WithExistingId_ReturnsOkResult()
        {
            // Arrange
            var booking = new Booking
            {
                UserId = "1",
                Location = "Test Room",
                BookingAt = new DateTime(2024, 12, 25, 14, 30, 0),
                Reason = "Test meeting",
                Capacity = 5,
                Contact = "test@example.com",
                CreatedAt = DateTime.UtcNow
            };

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetById(booking.Id);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var returnedBooking = Assert.IsType<Booking>(okResult.Value);
            Assert.Equal(booking.Id, returnedBooking.Id);
            Assert.Equal("Test Room", returnedBooking.Location);
        }

        [Fact]
        //Check behavior when booking does not exist. ----------------------------------------------------
        public async Task GetById_WithNonExistentId_ReturnsNotFound()
        {
            // Act
            var result = await _controller.GetById(999);

            // Assert
            Assert.IsType<NotFoundResult>(result.Result);
        }

        [Fact]
        public async Task Create_SetsCreatedAtToUtcNow()
        {
            // Arrange
            var beforeCreate = DateTime.UtcNow;
            var dto = new BookingCreateDto
            {
                Location = "Conference Room A",
                Date = "2024-12-25",
                Time = "14:30",
                Reason = "Team meeting",
                Capacity = 10,
                Contact = "john.doe@example.com"
            };

            // Act
            await _controller.Create(dto);
            var afterCreate = DateTime.UtcNow;

            // Assert
            var savedBooking = await _context.Bookings.FirstAsync();
            Assert.True(savedBooking.CreatedAt >= beforeCreate);
            Assert.True(savedBooking.CreatedAt <= afterCreate);
        }

        [Theory]
        [InlineData("", "2024-12-25", "14:30", "Reason", 10, "contact@test.com")] // Empty location
        [InlineData("Location", "", "14:30", "Reason", 10, "contact@test.com")]   // Empty date
        [InlineData("Location", "2024-12-25", "", "Reason", 10, "contact@test.com")] // Empty time
        [InlineData("Location", "2024-12-25", "14:30", "", 10, "contact@test.com")] // Empty reason
        [InlineData("Location", "2024-12-25", "14:30", "Reason", 10, "")] // Empty contact
        [InlineData("Location", "2024-12-25", "14:30", "Reason", -1, "contact@test.com")] // Negative capacity
        public async Task Create_WithInvalidInput_ReturnsBadRequest(
            string location, string date, string time, string reason, int capacity, string contact)
        {
            // Arrange
            var dto = new BookingCreateDto
            {
                Location = location,
                Date = date,
                Time = time,
                Reason = reason,
                Capacity = capacity,
                Contact = contact
            };

            // Act
            var result = await _controller.Create(dto);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result.Result);
        }
    }
}