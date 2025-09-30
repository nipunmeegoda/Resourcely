using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Helpers
{
    public static class DatabaseInitializer
    {
        public static async Task InitializeDatabase(IConfiguration configuration, bool throwOnFailure = false)
        {
            var connectionString = configuration.GetConnectionString("Default");
            
            Console.WriteLine("Starting database initialization...");
            
            try
            {
                // Create admin user using Entity Framework
                await CreateAdminUser(configuration);
                Console.WriteLine("Database initialization completed successfully.");
            }
            catch (Exception ex)
            {
                // Handle exceptions with more detailed logging
                Console.WriteLine($"Database initialization error: {ex.Message}");
                Console.WriteLine("The application will continue without database initialization.");
                
                if (throwOnFailure)
                {
                    throw; // Re-throw only if explicitly requested
                }
                
                // Log but don't crash the application
                Console.WriteLine("Skipping database initialization due to connection issues.");
            }
        }

        private static async Task CreateAdminUser(IConfiguration configuration)
        {
            const int maxRetries = 3;
            const int retryDelayMs = 2000;
            
            for (int attempt = 1; attempt <= maxRetries; attempt++)
            {
                try
                {
                    Console.WriteLine($"Attempting to create admin user (attempt {attempt}/{maxRetries})...");
                    
                    var connectionString = configuration.GetConnectionString("Default");
                    var options = new DbContextOptionsBuilder<AppDbContext>()
                        .UseSqlServer(connectionString, sqlOptions =>
                        {
                            sqlOptions.CommandTimeout(30);
                            sqlOptions.EnableRetryOnFailure(
                                maxRetryCount: 3,
                                maxRetryDelay: TimeSpan.FromSeconds(5),
                                errorNumbersToAdd: null);
                        })
                        .Options;

                    using (var context = new AppDbContext(options))
                    {
                        // Test connection first
                        await context.Database.CanConnectAsync();
                        
                        // Check if admin user already exists
                        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Email == "admin@example.com");
                        if (existingAdmin != null)
                        {
                            Console.WriteLine("Admin user already exists.");
                            return;
                        }

                        // Create admin user with proper password hashing
                        var (hash, salt) = PasswordHelper.HashPassword("admin123");
                        
                        var adminUser = new User
                        {
                            Email = "admin@example.com",
                            Username = "admin",
                            PasswordHash = hash,
                            PasswordSalt = salt,
                            Role = "Admin",
                            CreatedAt = DateTime.UtcNow
                        };

                        context.Users.Add(adminUser);
                        await context.SaveChangesAsync();
                        
                        Console.WriteLine("Admin user created successfully: admin@example.com / admin123");
                        return; // Success, exit retry loop
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error creating admin user on attempt {attempt}: {ex.Message}");
                    
                    if (attempt < maxRetries)
                    {
                        Console.WriteLine($"Retrying in {retryDelayMs}ms...");
                        await Task.Delay(retryDelayMs);
                    }
                    else
                    {
                        Console.WriteLine("Failed to create admin user after all retry attempts. The app will continue without the admin user.");
                        throw; // Re-throw on final attempt
                    }
                }
            }
        }
    }
}