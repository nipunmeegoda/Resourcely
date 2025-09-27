using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend_Resourcely.Helpers
{
    public static class DatabaseInitializer
    {
        public static async Task InitializeDatabase(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("Default");
            
            Console.WriteLine("Starting database initialization...");
            
            // Use the reset script to ensure a clean database state
            var sqlScripts = new[]
            {
                "SqlScripts/ResetDatabase.sql"
            };

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    Console.WriteLine("Database connection established.");

                    foreach (var scriptPath in sqlScripts)
                    {
                        if (File.Exists(scriptPath))
                        {
                            Console.WriteLine($"Executing script: {scriptPath}");
                            var sqlScript = await File.ReadAllTextAsync(scriptPath);
                            
                            // Split by GO statements and execute each batch
                            var batches = sqlScript.Split(new[] { "GO" }, StringSplitOptions.RemoveEmptyEntries);
                            
                            foreach (var batch in batches)
                            {
                                var trimmedBatch = batch.Trim();
                                if (!string.IsNullOrEmpty(trimmedBatch))
                                {
                                    using (var command = new SqlCommand(trimmedBatch, connection))
                                    {
                                        command.CommandTimeout = 30;
                                        await command.ExecuteNonQueryAsync();
                                    }
                                }
                            }
                            Console.WriteLine($"Successfully executed: {scriptPath}");
                        }
                        else
                        {
                            Console.WriteLine($"Warning: Script file not found: {scriptPath}");
                        }
                    }
                    
                    Console.WriteLine("Database initialization completed successfully.");
                }

                // Create admin user using Entity Framework
                await CreateAdminUser(configuration);
                
            }
            catch (Exception ex)
            {
                // Handle exceptions with more detailed logging
                Console.WriteLine($"Database initialization error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                throw; // Re-throw to let the application know initialization failed
            }
        }

        private static async Task CreateAdminUser(IConfiguration configuration)
        {
            try
            {
                Console.WriteLine("Creating admin user...");
                
                var connectionString = configuration.GetConnectionString("Default");
                var options = new DbContextOptionsBuilder<AppDbContext>()
                    .UseSqlServer(connectionString)
                    .Options;

                using (var context = new AppDbContext(options))
                {
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
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating admin user: {ex.Message}");
                // Don't throw here, as the app can still run without the admin user
            }
        }
    }
}