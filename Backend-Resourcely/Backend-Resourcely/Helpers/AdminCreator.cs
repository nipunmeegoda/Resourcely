using System;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;


namespace Backend_Resourcely.Helpers;

public class AdminCreator
{
    public static async Task CreateAdminUser(ApplicationDbContext context, string email, string username, string password)
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
            FirstName = "Admin",
            LastName = "User",
            PasswordHash = hash,
            PasswordSalt = salt,
            RoleType = "admin",
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();

        Console.WriteLine($"Admin user created successfully '{email}'.");
    }

}
