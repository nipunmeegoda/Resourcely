using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.IO;

namespace Backend_Resourcely.Helpers
{
    public static class DatabaseInitializer
    {
        public static async Task InitializeDatabase(IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("Default");
            var sqlScript = await File.ReadAllTextAsync("SqlScripts/CreateTables.sql");

            try
            {
                using (var connection = new SqlConnection(connectionString))
                {
                    await connection.OpenAsync();
                    using (var command = new SqlCommand(sqlScript, connection))
                    {
                        await command.ExecuteNonQueryAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                // Handle exceptions
                Console.WriteLine($"An error occurred: {ex.Message}");
            }
        }
    }
}