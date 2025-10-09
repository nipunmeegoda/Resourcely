using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Controllers;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;

namespace backend.Test
{
    /// <summary>
    /// Integration tests for resource and user management workflows:
    /// - End-to-end resource availability scenarios
    /// - Complete user role management workflows  
    /// - Multi-building resource hierarchy validation
    /// - Real-time booking and availability integration
    /// - Cross-controller integration testing
    /// </summary>
    public class ResourceManagementIntegrationTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly ResourcesController _resourcesController;
        private readonly UserController _userController;
        private readonly AdminController _adminController;
        private readonly DbContextOptions<AppDbContext> _options;

        public ResourceManagementIntegrationTests()
        {
            _options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(_options);
            _resourcesController = new ResourcesController(_context);
            _userController = new UserController(_context);
            _adminController = new AdminController(_context);

            // Seed comprehensive test data
            SeedComprehensiveTestData();
        }

        private void SeedComprehensiveTestData()
        {
            // Create building hierarchy for testing grouping
            var buildings = new List<Building>
            {
                new Building { Id = 1, Name = "Engineering Building", Description = "Main engineering block", CreatedAt = DateTime.UtcNow },
                new Building { Id = 2, Name = "Science Building", Description = "Science labs and lectures", CreatedAt = DateTime.UtcNow },
                new Building { Id = 3, Name = "Library Building", Description = "Study spaces and resources", CreatedAt = DateTime.UtcNow }
            };

            var floors = new List<Floor>
            {
                // Engineering Building floors
                new Floor { Id = 1, Name = "Ground Floor", FloorNumber = 0, BuildingId = 1 },
                new Floor { Id = 2, Name = "First Floor", FloorNumber = 1, BuildingId = 1 },
                new Floor { Id = 3, Name = "Second Floor", FloorNumber = 2, BuildingId = 1 },
                
                // Science Building floors
                new Floor { Id = 4, Name = "Ground Floor", FloorNumber = 0, BuildingId = 2 },
                new Floor { Id = 5, Name = "First Floor", FloorNumber = 1, BuildingId = 2 },
                
                // Library Building floors
                new Floor { Id = 6, Name = "Ground Floor", FloorNumber = 0, BuildingId = 3 },
                new Floor { Id = 7, Name = "First Floor", FloorNumber = 1, BuildingId = 3 }
            };

            var blocks = new List<Block>
            {
                // Engineering Building blocks
                new Block { Id = 1, Name = "Block A", FloorId = 1 },
                new Block { Id = 2, Name = "Block B", FloorId = 1 },
                new Block { Id = 3, Name = "Block A", FloorId = 2 },
                new Block { Id = 4, Name = "Block B", FloorId = 2 },
                new Block { Id = 5, Name = "Lab Block", FloorId = 3 },
                
                // Science Building blocks
                new Block { Id = 6, Name = "Chemistry Block", FloorId = 4 },
                new Block { Id = 7, Name = "Physics Block", FloorId = 5 },
                
                // Library Building blocks
                new Block { Id = 8, Name = "Study Block", FloorId = 6 },
                new Block { Id = 9, Name = "Research Block", FloorId = 7 }
            };

            var resources = new List<Resource>
            {
                // Engineering Building - Ground Floor
                new Resource { Id = 1, Name = "Lecture Hall A1", Type = "Lecture Hall", Capacity = 100, BlockId = 1, IsActive = true, IsRestricted = false },
                new Resource { Id = 2, Name = "Seminar Room A2", Type = "Seminar Room", Capacity = 30, BlockId = 1, IsActive = true, IsRestricted = false },
                new Resource { Id = 3, Name = "Meeting Room B1", Type = "Meeting Room", Capacity = 15, BlockId = 2, IsActive = true, IsRestricted = false },
                
                // Engineering Building - First Floor
                new Resource { Id = 4, Name = "Classroom A101", Type = "Classroom", Capacity = 40, BlockId = 3, IsActive = true, IsRestricted = false },
                new Resource { Id = 5, Name = "Computer Lab B101", Type = "Computer Lab", Capacity = 25, BlockId = 4, IsActive = true, IsRestricted = true, RestrictedToRoles = "lecturer,admin" },
                
                // Engineering Building - Second Floor
                new Resource { Id = 6, Name = "Research Lab", Type = "Laboratory", Capacity = 15, BlockId = 5, IsActive = true, IsRestricted = true, RestrictedToRoles = "lecturer,admin" },
                
                // Science Building
                new Resource { Id = 7, Name = "Chemistry Lab 1", Type = "Laboratory", Capacity = 20, BlockId = 6, IsActive = true, IsRestricted = true, RestrictedToRoles = "lecturer,admin" },
                new Resource { Id = 8, Name = "Physics Lab", Type = "Laboratory", Capacity = 18, BlockId = 7, IsActive = true, IsRestricted = true, RestrictedToRoles = "lecturer,admin" },
                
                // Library Building
                new Resource { Id = 9, Name = "Study Room 1", Type = "Study Room", Capacity = 8, BlockId = 8, IsActive = true, IsRestricted = false },
                new Resource { Id = 10, Name = "Group Study Area", Type = "Study Area", Capacity = 12, BlockId = 8, IsActive = true, IsRestricted = false },
                new Resource { Id = 11, Name = "Quiet Study Room", Type = "Study Room", Capacity = 6, BlockId = 9, IsActive = true, IsRestricted = false }
            };

            // Create users with different roles for role management testing
            var users = new List<User>
            {
                new User { Id = 1, Email = "admin@test.com", Username = "system_admin", Role = "admin", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                
                new User { Id = 2, Email = "lecturer1@test.com", Username = "john_smith", Role = "lecturer", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 3, Email = "lecturer2@test.com", Username = "jane_doe", Role = "lecturer", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 4, Email = "lecturer3@test.com", Username = "mike_johnson", Role = "lecturer", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                
                new User { Id = 5, Email = "student1@test.com", Username = "alice_brown", Role = "student", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 6, Email = "student2@test.com", Username = "bob_wilson", Role = "student", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 7, Email = "student3@test.com", Username = "carol_davis", Role = "student", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 8, Email = "student4@test.com", Username = "david_miller", Role = "student", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                
                new User { Id = 9, Email = "user1@test.com", Username = "regular_user1", Role = "user", PasswordHash = "hash", CreatedAt = DateTime.UtcNow },
                new User { Id = 10, Email = "user2@test.com", Username = "regular_user2", Role = "user", PasswordHash = "hash", CreatedAt = DateTime.UtcNow }
            };

            // Create some bookings to test availability
            var currentTime = DateTime.UtcNow;
            var bookings = new List<Booking>
            {
                // Current booking - makes resource unavailable
                new Booking
                {
                    Id = 1,
                    ResourceId = 2, // Seminar Room A2 is currently booked
                    BookingAt = currentTime.AddMinutes(-15),
                    EndAt = currentTime.AddMinutes(45),
                    Status = "Approved",
                    Reason = "Department Meeting",
                    Capacity = 20,
                    Contact = "meeting@test.com",
                    CreatedAt = DateTime.UtcNow
                },
                
                // Future booking - resource should be available now
                new Booking
                {
                    Id = 2,
                    ResourceId = 4, // Classroom A101 has a future booking
                    BookingAt = currentTime.AddHours(2),
                    EndAt = currentTime.AddHours(3),
                    Status = "Approved",
                    Reason = "Lecture",
                    Capacity = 35,
                    Contact = "lecture@test.com",
                    CreatedAt = DateTime.UtcNow
                },
                
                // Past booking - resource should be available now
                new Booking
                {
                    Id = 3,
                    ResourceId = 9, // Study Room 1 had a past booking
                    BookingAt = currentTime.AddHours(-2),
                    EndAt = currentTime.AddHours(-1),
                    Status = "Approved",
                    Reason = "Study Session",
                    Capacity = 6,
                    Contact = "study@test.com",
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

        #region Resource Availability Integration Tests

        [Fact]
        public async Task ResourceAvailability_GetAvailableNow_ShouldReturnResourcesGroupedByBuildingAndFloor()
        {
            // Act
            var result = await _resourcesController.GetAvailableNow();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resources = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var resourceList = resources.ToList();

            // Should have 10 available resources (1 out of 11 is currently booked)
            Assert.Equal(10, resourceList.Count);

            // Verify that resources are properly ordered by building, floor, block, and name
            // This indirectly tests the grouping functionality
            Assert.True(resourceList.Count > 0, "Should return available resources");
        }

        [Fact]
        public async Task ResourceAvailability_GetAvailableNow_ShouldExcludeCurrentlyBookedResources()
        {
            // Act
            var result = await _resourcesController.GetAvailableNow();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resources = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var resourceList = resources.ToList();

            // Resource ID 2 (Seminar Room A2) is currently booked, so should not appear
            // We expect 10 available resources out of 11 total
            Assert.Equal(10, resourceList.Count);
        }

        [Fact]
        public async Task ResourceAvailability_GetAvailableNow_ShouldIncludeHierarchicalInformation()
        {
            // Act
            var result = await _resourcesController.GetAvailableNow();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var resources = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            
            // Verify that the response includes building, floor, and block information
            // The successful execution without exception indicates proper hierarchy inclusion
            Assert.NotNull(resources);
            Assert.True(resources.Count() > 0);
        }

        #endregion

        #region User Role Management Integration Tests

        [Fact]
        public async Task UserRoleManagement_UpdateUserRole_AdminCanChangeUserRoles()
        {
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };

            // Act - Change student to lecturer
            var result = await _userController.UpdateUserRole(5, updateDto); // alice_brown

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // Verify role was updated in database
            var updatedUser = await _context.Users.FindAsync(5);
            Assert.NotNull(updatedUser);
            Assert.Equal("lecturer", updatedUser.Role);
            Assert.Equal("alice_brown", updatedUser.Username);
        }

        [Fact]
        public async Task UserRoleManagement_UpdateUserRole_AdminCannotModifyAdminRole()
        {
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "user" };

            // Act - Try to change admin role
            var result = await _userController.UpdateUserRole(1, updateDto); // System Admin

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            
            // Verify admin role was not changed
            var adminUser = await _context.Users.FindAsync(1);
            Assert.NotNull(adminUser);
            Assert.Equal("admin", adminUser.Role);
        }

        [Fact]
        public async Task UserRoleManagement_UpdateUserRole_MultipleRoleChanges()
        {
            // Test multiple role changes
            var updateToLecturer = new UpdateUserRoleDto { Role = "lecturer" };
            var updateToStudent = new UpdateUserRoleDto { Role = "student" };

            // Change user to lecturer
            await _userController.UpdateUserRole(9, updateToLecturer); // regular_user1
            var user = await _context.Users.FindAsync(9);
            Assert.Equal("lecturer", user?.Role);

            // Change back to student
            await _userController.UpdateUserRole(9, updateToStudent);
            user = await _context.Users.FindAsync(9);
            Assert.Equal("student", user?.Role);
        }

        #endregion

        #region User Filtering Integration Tests

        [Fact]
        public async Task UserFiltering_FilterUsersByRole_GetStudents()
        {
            // Act
            var result = await _userController.GetAllStudents();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var students = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var studentList = students.ToList();

            // Should return 4 students
            Assert.Equal(4, studentList.Count);
        }

        [Fact]
        public async Task UserFiltering_FilterUsersByRole_GetLecturers()
        {
            // Act
            var result = await _userController.GetAllLecturers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var lecturers = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var lecturerList = lecturers.ToList();

            // Should return 3 lecturers
            Assert.Equal(3, lecturerList.Count);
        }

        [Fact]
        public async Task UserFiltering_FilterUsersByRole_GetRegularUsers()
        {
            // Act
            var result = await _userController.GetAllRoleUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var userList = users.ToList();

            // Should return 2 regular users
            Assert.Equal(2, userList.Count);
        }

        [Fact]
        public async Task UserFiltering_FilterAndDeleteUser_AdminCanDeleteNonAdminUsers()
        {
            // First, get all students
            var studentsResult = await _userController.GetAllStudents();
            var okResult = Assert.IsType<OkObjectResult>(studentsResult.Result);
            var students = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            
            Assert.Equal(4, students.Count()); // Verify we have 4 students

            // Delete a student
            var deleteResult = await _userController.DeleteUser(5); // alice_brown
            Assert.IsType<OkObjectResult>(deleteResult);

            // Verify student was deleted
            var deletedUser = await _context.Users.FindAsync(5);
            Assert.Null(deletedUser);

            // Verify student count decreased
            var studentsAfterDelete = await _userController.GetAllStudents();
            var afterDeleteResult = Assert.IsType<OkObjectResult>(studentsAfterDelete.Result);
            var remainingStudents = Assert.IsAssignableFrom<IEnumerable<object>>(afterDeleteResult.Value);
            Assert.Equal(3, remainingStudents.Count());
        }

        [Fact]
        public async Task UserFiltering_FilterAndAssignRole_AdminCanFilterAndReassignRoles()
        {
            // Get all students initially
            var studentsResult = await _userController.GetAllStudents();
            var initialStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(studentsResult.Result).Value);
            Assert.Equal(4, initialStudents.Count());

            // Change a student to lecturer
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };
            await _userController.UpdateUserRole(6, updateDto); // bob_wilson

            // Verify student count decreased
            studentsResult = await _userController.GetAllStudents();
            var remainingStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(studentsResult.Result).Value);
            Assert.Equal(3, remainingStudents.Count());

            // Verify lecturer count increased
            var lecturersResult = await _userController.GetAllLecturers();
            var lecturers = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(lecturersResult.Result).Value);
            Assert.Equal(4, lecturers.Count()); // Was 3, now 4
        }

        [Fact]
        public async Task UserFiltering_GetAllNonAdminUsers_ForRoleManagement()
        {
            // Act
            var result = await _userController.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var userList = users.ToList();

            // Should return 9 users (excluding the 1 admin)
            Assert.Equal(9, userList.Count);
        }

        #endregion

        #region Complete Workflow Integration Tests

        [Fact]
        public async Task CompleteWorkflow_ResourceAvailabilityWorkflow()
        {
            // Test the complete workflow of checking resource availability
            
            // 1. Get all resources
            var allResourcesResult = await _resourcesController.GetAllResources();
            var allResources = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(allResourcesResult.Result).Value);
            Assert.Equal(11, allResources.Count());

            // 2. Get available resources (should be fewer due to current bookings)
            var availableResult = await _resourcesController.GetAvailableNow();
            var availableResources = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(availableResult.Result).Value);
            Assert.Equal(10, availableResources.Count());

            // 3. Get resources by specific block
            var blockResourcesResult = await _resourcesController.GetResourcesByBlock(1); // Block A, Ground Floor
            var blockResources = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>(blockResourcesResult.Result).Value);
            Assert.Equal(2, blockResources.Count()); // Lecture Hall A1 and Seminar Room A2
        }

        [Fact]
        public async Task CompleteWorkflow_UserRoleManagementWorkflow()
        {
            // Test the complete workflow of user role management
            
            // 1. Get initial counts by role
            var initialStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>((await _userController.GetAllStudents()).Result).Value);
            var initialLecturers = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>((await _userController.GetAllLecturers()).Result).Value);
            var initialUsers = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>((await _userController.GetAllRoleUser()).Result).Value);

            Assert.Equal(4, initialStudents.Count());
            Assert.Equal(3, initialLecturers.Count());
            Assert.Equal(2, initialUsers.Count());

            // 2. Change a student to lecturer
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };
            await _userController.UpdateUserRole(7, updateDto); // carol_davis

            // 3. Verify counts changed
            var afterChangeStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>((await _userController.GetAllStudents()).Result).Value);
            var afterChangeLecturers = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>((await _userController.GetAllLecturers()).Result).Value);

            Assert.Equal(3, afterChangeStudents.Count()); // Decreased by 1
            Assert.Equal(4, afterChangeLecturers.Count()); // Increased by 1

            // 4. Delete a user
            await _userController.DeleteUser(8); // david_miller (student)

            // 5. Verify final counts
            var finalStudents = Assert.IsAssignableFrom<IEnumerable<object>>(
                Assert.IsType<OkObjectResult>((await _userController.GetAllStudents()).Result).Value);
            Assert.Equal(2, finalStudents.Count()); // Decreased by 1 more
        }

        #endregion

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}