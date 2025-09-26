using System;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;


namespace Backend_Resourcely.Helpers;

public class AdminCreator
{
    public static async Task CreateAdminUser(AppDbContext context, string email, string username, string password)
    {
        if (await context.Users.AnyAsync(u => u.Email == email))
        {
            Console.WriteLine($"The email '{email}' already exists");
            return;
        }

        var (hash, salt) = PasswordHelper.HashPassword(password);

        var adminUser = new User
        {
            Email = email,
            Username = username,
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        Console.WriteLine($"Admin user created successfully '{email}'.");
    }

    public static async Task CreateTestUsers(AppDbContext context)
    {
        // Create a teacher user for testing
        var teacherEmail = "teacher@test.com";
        if (!await context.Users.AnyAsync(u => u.Email == teacherEmail))
        {
            var (hash, salt) = PasswordHelper.HashPassword("teacher123");
            var teacherUser = new User
            {
                Email = teacherEmail,
                Username = "Teacher",
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = "Teacher",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(teacherUser);
            Console.WriteLine("Teacher user created for testing.");
        }

        // Create a student user for testing
        var studentEmail = "student@test.com";
        if (!await context.Users.AnyAsync(u => u.Email == studentEmail))
        {
            var (hash, salt) = PasswordHelper.HashPassword("student123");
            var studentUser = new User
            {
                Email = studentEmail,
                Username = "Student",
                PasswordHash = hash,
                PasswordSalt = salt,
                Role = "Student",
                CreatedAt = DateTime.UtcNow
            };
            context.Users.Add(studentUser);
            Console.WriteLine("Student user created for testing.");
        }

        await context.SaveChangesAsync();
    }
}
