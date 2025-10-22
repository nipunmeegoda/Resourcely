using System.Net;
using System.Net.Http.Json;
using Backend_Resourcely.Data;
using Backend_Resourcely.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace backend.Test
{
    public class DepartmentControllerIntegrationTests
    {
        private IHost CreateHost(string dbName)
        {
            var hostBuilder = Host.CreateDefaultBuilder()
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseTestServer();
                    webBuilder.ConfigureServices(services =>
                    {
                        services.AddControllers()
                            .AddApplicationPart(typeof(Backend_Resourcely.Controllers.DepartmentController).Assembly);

                        services.AddDbContext<AppDbContext>(options =>
                            options.UseInMemoryDatabase(dbName));
                    });
                    webBuilder.Configure(app =>
                    {
                        app.UseRouting();
                        app.UseAuthorization();
                        app.UseEndpoints(endpoints => { endpoints.MapControllers(); });
                    });
                });

            var host = hostBuilder.Start();
            return host;
        }

        [Fact]
        public async Task PostDepartment_MissingName_Returns400_ApiController()
        {
            using var host = CreateHost(dbName: Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            var response = await client.PostAsJsonAsync("/api/department", new { });

            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            // ProblemDetails is returned by default; content shape may vary, so we only assert status for robustness
        }

        [Fact(Skip = "Pending implementation: enforce unique Department.Name and return 409 on duplicates")]
        public async Task PostDepartment_DuplicateNames_Returns409_AndDoesNotIncreaseCount()
        {
            using var host = CreateHost(dbName: Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            var first = await client.PostAsJsonAsync("/api/department", new { name = "Computer Science", description = "CS" });
            Assert.Equal(HttpStatusCode.Created, first.StatusCode);

            var second = await client.PostAsJsonAsync("/api/department", new { name = "Computer Science", description = "CS-2" });
            Assert.Equal(HttpStatusCode.Conflict, second.StatusCode);

            using var scope = host.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            Assert.Equal(1, db.Departments.Count(d => d.Name == "Computer Science"));
        }

        [Fact]
        public async Task PostDepartment_NoTrimming_NameIsPersistedAsSent()
        {
            using var host = CreateHost(dbName: Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            var rawName = "  Name With Spaces  ";
            var created = await client.PostAsJsonAsync("/api/department", new { name = rawName, description = "x" });
            Assert.Equal(HttpStatusCode.Created, created.StatusCode);

            using var scope = host.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var dep = db.Departments.Single();
            Assert.Equal(rawName, dep.Name);
            Assert.NotEqual(rawName.Trim(), dep.Name); // explicitly assert no trimming occurred
        }

        [Fact]
        public async Task PostDepartment_NameIsNotTrimmed_PersistsWhitespace()
        {
            using var host = CreateHost(dbName: Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            var rawName = "  CS  ";
            var response = await client.PostAsJsonAsync("/api/department", new { name = rawName, description = "desc" });
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);

            using var scope = host.Services.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var dep = db.Departments.Single();
            Assert.Equal("  CS  ", dep.Name);
            Assert.NotEqual("CS", dep.Name);
        }

        [Fact]
        public async Task GetDepartments_ReturnsSortedByName_Ascending()
        {
            using var host = CreateHost(dbName: Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            // Seed
            using (var scope = host.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.Departments.AddRange(
                    new Department { Name = "Zeta" },
                    new Department { Name = "Alpha" },
                    new Department { Name = "Alpha" },
                    new Department { Name = "Beta" }
                );
                db.SaveChanges();
            }

            var response = await client.GetAsync("/api/department");
            response.EnsureSuccessStatusCode();
            var list = await response.Content.ReadFromJsonAsync<List<Department>>();
            Assert.NotNull(list);

            // Assert non-decreasing by Name; no tie-breaker enforced for equal names
            for (int i = 1; i < list!.Count; i++)
            {
                Assert.True(string.Compare(list[i - 1].Name, list[i].Name, StringComparison.Ordinal) <= 0,
                    $"List is not sorted at index {i - 1} -> {i}: '{list[i - 1].Name}' > '{list[i].Name}'");
            }
        }
    }
}


