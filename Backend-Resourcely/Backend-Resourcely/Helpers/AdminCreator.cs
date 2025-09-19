using System;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;


namespace Backend_Resourcely.Helpers;

public class AdminCreator
{
    public static async Task CreateAdminUser(AppDbContext context, string email, string username, string passwword)
    {
        if (await DbContext.Users.AnyAsync(u => u.Email == email))
        {
            Console.WriteLine(" the email '{email}' alrady exists");
            return;
        }

        var (hash, salt) = PasswordHelper.HashPassword(passwword);

        var adminUser = new User
        {
            Email = email,
            Username = "Admin",
            PasswordHash = hash,
            PasswordSalt = salt,
            Role = "Admin",
            CreatedAt = DateTime.UtcNow
        };

        DbContext.Users.Add(adminUser);
        await DbContext.SaveChangesAsync();

        Console.WriteLine("Admin user created successfully '{email}'.");
    }

}
