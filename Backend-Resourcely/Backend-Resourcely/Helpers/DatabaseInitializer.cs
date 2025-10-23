using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Data.SqlClient;

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
                // Step 1: Run SQL scripts to create tables if they don't exist
                await ExecuteSqlScripts(connectionString);

                // Step 2: Create admin user using Entity Framework (if not already created by SQL script)
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

        private static async Task ExecuteSqlScripts(string connectionString)
        {
            Console.WriteLine("Executing SQL scripts to create database schema...");

            var sqlScriptFiles = new[]
            {
                "SqlScripts/CreateTables.sql"
                // AddPermissionsAndApprovals.sql is not needed as CreateTables.sql already includes all columns
            };

            using (var connection = new SqlConnection(connectionString))
            {
                await connection.OpenAsync();

                foreach (var scriptPath in sqlScriptFiles)
                {
                    if (File.Exists(scriptPath))
                    {
                        Console.WriteLine($"Executing {scriptPath}...");
                        var sqlScript = await File.ReadAllTextAsync(scriptPath);

                        // Split by GO statements and execute each batch separately
                        var batches = sqlScript.Split(new[] { "\r\nGO\r\n", "\nGO\n", "\r\nGO\n", "\nGO\r\n" }, StringSplitOptions.RemoveEmptyEntries);

                        foreach (var batch in batches)
                        {
                            if (!string.IsNullOrWhiteSpace(batch))
                            {
                                using (var command = new SqlCommand(batch, connection))
                                {
                                    command.CommandTimeout = 60; // 60 seconds timeout
                                    await command.ExecuteNonQueryAsync();
                                }
                            }
                        }

                        Console.WriteLine($"Successfully executed {scriptPath}");
                    }
                    else
                    {
                        Console.WriteLine($"Warning: SQL script not found at {scriptPath}");
                    }
                }
            }

            Console.WriteLine("SQL scripts executed successfully.");
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

                        // Check if ANY admin user already exists (SQL script may have created one)
                        var existingAdmin = await context.Users.FirstOrDefaultAsync(u => u.Role == "Admin");
                        if (existingAdmin != null)
                        {
                            Console.WriteLine($"Admin user already exists: {existingAdmin.Email}");
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