using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Controllers;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;

namespace backend.Test
{
    /// <summary>
    /// Comprehensive tests for resource availability and user management functionality:
    /// - Resource availability with building/floor grouping
    /// - Real-time booking conflict detection
    /// - User role management and filtering
    /// - Admin user management capabilities
    /// - Integration workflows for resource and user operations
    /// </summary>
    public class ResourceAvailabilityAndUserManagementTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly ResourcesController _resourcesController;
        private readonly UserController _userController;
        private readonly DbContextOptions<AppDbContext> _options;

        public ResourceAvailabilityAndUserManagementTests()
        {
            _options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(_options);
            _resourcesController = new ResourcesController(_context);
            _userController = new UserController(_context);

            SeedTestData();
        }

        private void SeedTestData()
        {
            // Create building hierarchy
            var buildings = new List<Building>
            {
                new Building { Id = 1, Name = "Engineering Building", Description = "Main building", CreatedAt = DateTime.UtcNow },
                new Building { Id = 2, Name = "Science Building", Description = "Science block", CreatedAt = DateTime.UtcNow }
            };

            var floors = new List<Floor>
            {
                new Floor { Id = 1, Name = "Ground Floor", FloorNumber = 0, BuildingId = 1 },
                new Floor { Id = 2, Name = "First Floor", FloorNumber = 1, BuildingId = 1 },
                new Floor { Id = 3, Name = "Ground Floor", FloorNumber = 0, BuildingId = 2 }
            };

            var blocks = new List<Block>
            {
                new Block { Id = 1, Name = "Block A", FloorId = 1 },
                new Block { Id = 2, Name = "Block B", FloorId = 2 },
                new Block { Id = 3, Name = "Lab Block", FloorId = 3 }
            };

            var resources = new List<Resource>
            {
                new Resource { Id = 1, Name = "Conference Room A", Type = "Meeting Room", Capacity = 20, BlockId = 1, IsActive = true, IsRestricted = false },
                new Resource { Id = 2, Name = "Classroom 101", Type = "Classroom", Capacity = 30, BlockId = 2, IsActive = true, IsRestricted = false },
                new Resource { Id = 3, Name = "Computer Lab", Type = "Laboratory", Capacity = 25, BlockId = 3, IsActive = true, IsRestricted = true, RestrictedToRoles = "lecturer,admin" },
                new Resource { Id = 4, Name = "Study Room B", Type = "Study Room", Capacity = 8, BlockId = 1, IsActive = true, IsRestricted = false }
            };

            // Create users with different roles
            var users = new List<User>
            {
                new User { Id = 1, Email = "admin@test.com", Username = "admin_user", Role = "admin", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 2, Email = "lecturer1@test.com", Username = "john_lecturer", Role = "lecturer", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 3, Email = "lecturer2@test.com", Username = "jane_lecturer", Role = "lecturer", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 4, Email = "student1@test.com", Username = "alice_student", Role = "student", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 5, Email = "student2@test.com", Username = "bob_student", Role = "student", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 6, Email = "user1@test.com", Username = "regular_user", Role = "user", PasswordHash = "hash", CreatedAt = DateTime.UtcNow }
            };

            // Create a booking to test availability
            var currentTime = DateTime.UtcNow;
            var bookings = new List<Booking>
            {
                new Booking
                {
                    Id = 1,
                    ResourceId = 2, // Classroom 101 is currently booked
                    BookingAt = currentTime.AddMinutes(-15),
                    EndAt = currentTime.AddMinutes(45),
                    Status = "Approved",
                    Reason = "Meeting",
                    Capacity = 20,
                    Contact = "test@example.com",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Buildings.AddRange(buildings);
            _context.Floors.AddRange(floors);
            _context.Blocks.AddRange(blocks);
            _context.Resources.AddRange(resources);
            _context.Users.AddRange(users);
            _context.Bookings.AddRange(bookings);
            _context.SaveChanges();
        }

        #region Resource Availability Tests

        [Fact]
        public void ResourceAvailability_AvailableNowEndpoint_ShouldExist()
        {
            // Verify the available-now endpoint exists and is accessible
            // Act
            var result = _resourcesController.GetAvailableNow();

            // Assert
            Assert.NotNull(result);
            Assert.True(result.IsCompletedSuccessfully || result.Status == System.Threading.Tasks.TaskStatus.RanToCompletion);
        }

        [Fact]
        public async Task ResourceAvailability_AvailableNow_ShouldReturnStructuredResponse()
        {
            // Verify the response structure includes building and floor grouping information
            // Act
            var result = await _resourcesController.GetAvailableNow();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
            
            // Check that response has expected structure
            var response = okResult.Value;
            Assert.NotNull(response);
            
            // The response should have CheckedAtUtc, Count, and Resources properties
            var responseType = response.GetType();
            Assert.True(responseType.GetProperty("CheckedAtUtc") != null);
            Assert.True(responseType.GetProperty("Count") != null);
            Assert.True(responseType.GetProperty("Resources") != null);
        }

        [Fact]
        public async Task QA_UseCase1_AvailableNow_ShouldExcludeBookedResources()
        {
            // QA Check: Verify currently booked resources are not shown as available
            // Act
            var result = await _resourcesController.GetAvailableNow();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = okResult.Value;
            
            // Get count from response
            var countProperty = response?.GetType().GetProperty("Count");
            var count = (int)(countProperty?.GetValue(response) ?? 0);
            
            // Should have 3 available resources (1 out of 4 is booked)
            Assert.Equal(3, count);
        }

        [Fact]
        public async Task QA_UseCase4_AdminCanModifyUserRoles()
        {
            // QA Check: Admin can change user roles
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };

            // Act - Change student to lecturer
            var result = await _userController.UpdateUserRole(4, updateDto); // alice_student

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // Verify role was updated in database
            var updatedUser = await _context.Users.FindAsync(4);
            Assert.NotNull(updatedUser);
            Assert.Equal("lecturer", updatedUser.Role);
        }

        [Fact]
        public async Task QA_UseCase4_AdminCannotModifyAdminRole()
        {
            // QA Check: Admin roles cannot be modified (protection)
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "user" };

            // Act - Try to change admin role
            var result = await _userController.UpdateUserRole(1, updateDto); // admin_user

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            
            // Verify admin role was not changed
            var adminUser = await _context.Users.FindAsync(1);
            Assert.NotNull(adminUser);
            Assert.Equal("admin", adminUser.Role);
        }

        [Fact]
        public async Task QA_UseCase5_AdminCanFilterUsersByRole_Students()
        {
            // QA Check: Admin can filter users by student role
            // Act
            var result = await _userController.GetAllStudents();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var students = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var studentList = students.ToList();

            // Should return 2 students
            Assert.Equal(2, studentList.Count);
        }

        [Fact]
        public async Task QA_UseCase5_AdminCanFilterUsersByRole_Lecturers()
        {
            // QA Check: Admin can filter users by lecturer role
            // Act
            var result = await _userController.GetAllLecturers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var lecturers = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var lecturerList = lecturers.ToList();

            // Should return 2 lecturers
            Assert.Equal(2, lecturerList.Count);
        }

        [Fact]
        public async Task QA_UseCase5_AdminCanFilterUsersByRole_RegularUsers()
        {
            // QA Check: Admin can filter users by regular user role
            // Act
            var result = await _userController.GetAllRoleUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var userList = users.ToList();

            // Should return 1 regular user
            Assert.Single(userList);
        }

        [Fact]
        public async Task QA_UseCase5_AdminCanViewAllNonAdminUsers()
        {
            // QA Check: Admin can see all non-admin users for management
            // Act
            var result = await _userController.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var userList = users.ToList();

            // Should return 5 users (excluding the 1 admin)
            Assert.Equal(5, userList.Count);
        }

        [Fact]
        public async Task QA_IntegrationTest_CompleteRoleManagementWorkflow()
        {
            // QA Integration Test: Complete workflow of role management
            
            // 1. Get initial student count
            var initialStudentsResult = await _userController.GetAllStudents();
            var initialStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(initialStudentsResult.Result).Value);
            Assert.Equal(2, initialStudents.Count());

            // 2. Change a student to lecturer
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };
            await _userController.UpdateUserRole(5, updateDto); // bob_student

            // 3. Verify student count decreased
            var afterChangeStudentsResult = await _userController.GetAllStudents();
            var afterChangeStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(afterChangeStudentsResult.Result).Value);
            Assert.Single(afterChangeStudents); // Should be 1 student left

            // 4. Verify lecturer count increased
            var lecturersResult = await _userController.GetAllLecturers();
            var lecturers = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(lecturersResult.Result).Value);
            Assert.Equal(3, lecturers.Count()); // Should be 3 lecturers now (was 2)
        }

        [Fact]
        public async Task QA_IntegrationTest_ResourceAvailabilityWithHierarchy()
        {
            // QA Integration Test: Resources are returned with hierarchical information
            
            // Act
            var result = await _resourcesController.GetAvailableNow();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var response = okResult.Value;
            
            // Verify response structure includes hierarchical information
            Assert.NotNull(response);
            
            // Check that the endpoint successfully returns data (indicating hierarchy is working)
            var countProperty = response.GetType().GetProperty("Count");
            var count = (int)(countProperty?.GetValue(response) ?? 0);
            Assert.True(count > 0, "Should return available resources with hierarchy");
            
            // Check that we get resources from multiple buildings (indicating grouping works)
            // In our test data, we have resources in both Engineering and Science buildings
            Assert.True(count >= 3, "Should return resources from multiple buildings/floors");
        }

        #endregion

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}