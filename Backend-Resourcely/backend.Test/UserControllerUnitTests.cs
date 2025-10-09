using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Backend_Resourcely.Controllers;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Backend_Resourcely.Dto;

namespace backend.Test
{
    public class UserControllerUnitTests : IDisposable
    {
        private readonly AppDbContext _context;
        private readonly UserController _controller;
        private readonly DbContextOptions<AppDbContext> _options;

        public UserControllerUnitTests()
        {
            _options = new DbContextOptionsBuilder<AppDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new AppDbContext(_options);
            _controller = new UserController(_context);

            // Seed test data
            SeedTestData();
        }

        private void SeedTestData()
        {
            var users = new List<User>
            {
                new User
                {
                    Id = 1,
                    Email = "admin@test.com",
                    Username = "admin_user",
                    Role = "admin",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 2,
                    Email = "lecturer1@test.com",
                    Username = "john_lecturer",
                    Role = "lecturer",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 3,
                    Email = "lecturer2@test.com",
                    Username = "jane_professor",
                    Role = "lecturer",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 4,
                    Email = "student1@test.com",
                    Username = "alice_student",
                    Role = "student",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 5,
                    Email = "student2@test.com",
                    Username = "bob_learner",
                    Role = "student",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow
                },
                new User
                {
                    Id = 6,
                    Email = "user1@test.com",
                    Username = "regular_user",
                    Role = "user",
                    PasswordHash = "hashedpassword",
                    CreatedAt = DateTime.UtcNow
                }
            };

            _context.Users.AddRange(users);
            _context.SaveChanges();
        }

        [Fact]
        public async Task GetAllRoleUser_ShouldReturnOnlyUsersWithUserRole()
        {
            // Act
            var result = await _controller.GetAllRoleUser();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var userList = users.ToList();

            // Should return only 1 user with "user" role
            Assert.Single(userList);
        }

        [Fact]
        public async Task GetAllStudents_ShouldReturnOnlyStudents()
        {
            // Act
            var result = await _controller.GetAllStudents();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var students = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var studentList = students.ToList();

            // Should return 2 students
            Assert.Equal(2, studentList.Count);
        }

        [Fact]
        public async Task GetAllLecturers_ShouldReturnOnlyLecturers()
        {
            // Act
            var result = await _controller.GetAllLecturers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var lecturers = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var lecturerList = lecturers.ToList();

            // Should return 2 lecturers
            Assert.Equal(2, lecturerList.Count);
        }

        [Fact]
        public async Task GetAllUsers_ShouldReturnAllNonAdminUsers()
        {
            // Act
            var result = await _controller.GetAllUsers();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var users = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            var userList = users.ToList();

            // Should return 5 users (excluding admin)
            Assert.Equal(5, userList.Count);
        }

        [Fact]
        public async Task UpdateUserRole_ShouldUpdateNonAdminUserRole()
        {
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };

            // Act - Update student1 (ID = 4) to lecturer
            var result = await _controller.UpdateUserRole(4, updateDto);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // Verify the user's role was updated in the database
            var updatedUser = await _context.Users.FindAsync(4);
            Assert.NotNull(updatedUser);
            Assert.Equal("lecturer", updatedUser.Role);
        }

        [Fact]
        public async Task UpdateUserRole_ShouldReturnBadRequestForAdminUser()
        {
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "user" };

            // Act - Try to update admin user (ID = 1)
            var result = await _controller.UpdateUserRole(1, updateDto);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            
            // Verify admin role was not changed
            var adminUser = await _context.Users.FindAsync(1);
            Assert.NotNull(adminUser);
            Assert.Equal("admin", adminUser.Role);
        }

        [Fact]
        public async Task UpdateUserRole_ShouldReturnNotFoundForInvalidUserId()
        {
            // Arrange
            var updateDto = new UpdateUserRoleDto { Role = "lecturer" };

            // Act
            var result = await _controller.UpdateUserRole(999, updateDto);

            // Assert
            Assert.IsType<NotFoundObjectResult>(result);
        }

        [Fact]
        public async Task DeleteUser_ShouldDeleteNonAdminUser()
        {
            // Act - Delete student2 (ID = 5)
            var result = await _controller.DeleteUser(5);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            
            // Verify the user was deleted from the database
            var deletedUser = await _context.Users.FindAsync(5);
            Assert.Null(deletedUser);
        }

        [Fact]
        public async Task DeleteUser_ShouldReturnBadRequestForAdminUser()
        {
            // Act - Try to delete admin user (ID = 1)
            var result = await _controller.DeleteUser(1);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            
            // Verify admin user was not deleted
            var adminUser = await _context.Users.FindAsync(1);
            Assert.NotNull(adminUser);
        }

        [Fact]
        public async Task DeleteUser_ShouldReturnNotFoundForInvalidUserId()
        {
            // Act
            var result = await _controller.DeleteUser(999);

            // Assert
            Assert.IsType<NotFoundResult>(result);
        }

        [Fact]
        public async Task GetUserStats_ShouldReturnValidStats()
        {
            // Act
            var result = await _controller.GetUserStats();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            Assert.NotNull(okResult.Value);
        }

        [Fact]
        public async Task GetRecentBookings_ShouldReturnRecentBookingsList()
        {
            // Act
            var result = await _controller.GetRecentBookings();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var bookings = Assert.IsAssignableFrom<IEnumerable<object>>(okResult.Value);
            Assert.NotNull(bookings);
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}