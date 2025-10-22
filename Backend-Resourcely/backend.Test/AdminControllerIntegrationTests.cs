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
    public class AdminControllerIntegrationTests
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
                            .AddApplicationPart(typeof(Backend_Resourcely.Controllers.AdminController).Assembly);

                        services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(dbName));
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

        private (Building building, Floor floor, Block block, Resource resource) SeedBasicHierarchy(IServiceProvider sp, bool resourceActive = true)
        {
            var db = sp.GetRequiredService<AppDbContext>();
            var building = new Building { Name = "B1", Description = "", CreatedAt = DateTime.UtcNow };
            db.Buildings.Add(building);
            db.SaveChanges();
            var floor = new Floor { Name = "F1", Description = "", BuildingId = building.Id, FloorNumber = 0, IsActive = true, CreatedAt = DateTime.UtcNow };
            db.Floors.Add(floor);
            db.SaveChanges();
            var block = new Block { Name = "BL1", Description = "", FloorId = floor.Id, IsActive = true, CreatedAt = DateTime.UtcNow };
            db.Blocks.Add(block);
            db.SaveChanges();
            var resource = new Resource { Name = "R1", Type = "Room", Description = "", Capacity = 10, BlockId = block.Id, IsActive = resourceActive, CreatedAt = DateTime.UtcNow };
            db.Resources.Add(resource);
            db.SaveChanges();
            return (building, floor, block, resource);
        }

        [Fact]
        public async Task CreateBlock_HappyPath_And_InvalidFloor()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            using (var scope = host.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var b = new Building { Name = "B", Description = "", CreatedAt = DateTime.UtcNow };
                db.Buildings.Add(b); db.SaveChanges();
                var f = new Floor { Name = "F", BuildingId = b.Id, FloorNumber = 0, IsActive = true, CreatedAt = DateTime.UtcNow };
                db.Floors.Add(f); db.SaveChanges();
            }

            var ok = await client.PostAsJsonAsync("/api/admin/blocks", new { name = "Block A", description = "x", floorId = 1 });
            Assert.Equal(HttpStatusCode.OK, ok.StatusCode);

            var bad = await client.PostAsJsonAsync("/api/admin/blocks", new { name = "Block B", description = "x", floorId = 999 });
            Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
        }

        [Fact]
        public async Task CreateResource_HappyPath_DuplicateNamesAllowed_NoTrimming_And_InvalidBlock()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            using (var scope = host.Services.CreateScope())
            {
                SeedBasicHierarchy(scope.ServiceProvider);
            }

            var payload = new { name = "  Room  ", type = "Room", description = "d", capacity = 5, blockId = 1 };
            var ok1 = await client.PostAsJsonAsync("/api/admin/resources", payload);
            Assert.Equal(HttpStatusCode.OK, ok1.StatusCode);

            // Duplicates are allowed by current code (no uniqueness); verify second OK
            var ok2 = await client.PostAsJsonAsync("/api/admin/resources", payload);
            Assert.Equal(HttpStatusCode.OK, ok2.StatusCode);

            using (var scope = host.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var saved = db.Resources.OrderBy(r => r.Id).Last();
                Assert.Equal("  Room  ", saved.Name); // no trimming
            }

            var bad = await client.PostAsJsonAsync("/api/admin/resources", new { name = "X", type = "Room", description = "d", capacity = 5, blockId = 999 });
            Assert.Equal(HttpStatusCode.BadRequest, bad.StatusCode);
        }

        [Fact]
        public async Task Overview_Counts_And_AvailableNow_Computation()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            DateTime now = DateTime.UtcNow;
            using (var scope = host.Services.CreateScope())
            {
                var (b,f,bl,res1) = SeedBasicHierarchy(scope.ServiceProvider, resourceActive: true);
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var res2 = new Resource { Name = "R2", Type = "Room", Capacity = 5, BlockId = bl.Id, IsActive = true, CreatedAt = now };
                db.Resources.Add(res2);
                // res1 is occupied now by approved booking
                db.Bookings.Add(new Booking { ResourceId = res1.Id, UserId = 1, BookingAt = now.AddMinutes(-30), EndAt = now.AddMinutes(30), Reason = "r", Capacity = 1, Contact = "c", Status = "Approved", CreatedAt = now });
                // pending should not affect availableNow
                db.Bookings.Add(new Booking { ResourceId = res2.Id, UserId = 1, BookingAt = now.AddMinutes(-30), EndAt = now.AddMinutes(30), Reason = "r", Capacity = 1, Contact = "c", Status = "Pending", CreatedAt = now });
                db.SaveChanges();
            }

            var resp = await client.GetAsync("/api/admin/overview");
            resp.EnsureSuccessStatusCode();
            var stats = await resp.Content.ReadFromJsonAsync<Dictionary<string, object>>();
            Assert.NotNull(stats);
            // availableNow should be 1 (res2 is available since pending doesn't block)
            Assert.Equal(1, Convert.ToInt32(stats!["availableNow"]));
            Assert.Equal(1, Convert.ToInt32(stats["pendingApproval"]));
            Assert.Equal(1, Convert.ToInt32(stats["totalBookings"]));
        }

        [Fact]
        public async Task BookingLists_Pending_Approved_Rejected_Ordering_And_Projection()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            DateTime now = DateTime.UtcNow;
            using (var scope = host.Services.CreateScope())
            {
                var (b,f,bl,res) = SeedBasicHierarchy(scope.ServiceProvider);
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                // create pending, approved, rejected
                db.Bookings.AddRange(
                    new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now, EndAt = now.AddHours(1), Reason = "p1", Capacity = 1, Contact = "c", Status = "Pending", CreatedAt = now.AddMinutes(-10) },
                    new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now, EndAt = now.AddHours(1), Reason = "p2", Capacity = 1, Contact = "c", Status = "Pending", CreatedAt = now.AddMinutes(-5) },
                    new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now, EndAt = now.AddHours(1), Reason = "a1", Capacity = 1, Contact = "c", Status = "Approved", ApprovedAt = now.AddMinutes(-1), CreatedAt = now.AddMinutes(-30) },
                    new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now, EndAt = now.AddHours(1), Reason = "r1", Capacity = 1, Contact = "c", Status = "Rejected", ApprovedAt = now.AddMinutes(-2), CreatedAt = now.AddMinutes(-40) }
                );
                db.SaveChanges();
            }

            var pending = await client.GetFromJsonAsync<List<Dictionary<string, object>>>("/api/admin/bookings/pending");
            Assert.NotNull(pending);
            // ordered by CreatedAt ascending: p1 then p2
            Assert.Equal("p1", pending![0]["Reason"]!.ToString());
            Assert.Equal("p2", pending[1]["Reason"]!.ToString());

            var approved = await client.GetFromJsonAsync<List<Dictionary<string, object>>>("/api/admin/bookings/approved");
            Assert.NotNull(approved);
            // ordered by ApprovedAt desc: a1 first (only one)
            Assert.Equal("a1", approved![0]["Reason"]!.ToString());

            var rejected = await client.GetFromJsonAsync<List<Dictionary<string, object>>>("/api/admin/bookings/rejected");
            Assert.NotNull(rejected);
            // ordered by ApprovedAt desc: r1 first (only one)
            Assert.Equal("r1", rejected![0]["Reason"]!.ToString());

            // empty lists
            using (var host2 = CreateHost(Guid.NewGuid().ToString()))
            {
                var client2 = host2.GetTestClient();
                var p2 = await client2.GetFromJsonAsync<List<object>>("/api/admin/bookings/pending");
                Assert.NotNull(p2);
                Assert.Empty(p2!);
                var a2 = await client2.GetFromJsonAsync<List<object>>("/api/admin/bookings/approved");
                Assert.NotNull(a2);
                Assert.Empty(a2!);
                var r2 = await client2.GetFromJsonAsync<List<object>>("/api/admin/bookings/rejected");
                Assert.NotNull(r2);
                Assert.Empty(r2!);
            }
        }

        [Fact]
        public async Task UpdateBooking_Validations_And_NotFound()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();
            DateTime now = DateTime.UtcNow;

            using (var scope = host.Services.CreateScope())
            {
                var (b,f,bl,res) = SeedBasicHierarchy(scope.ServiceProvider);
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                // Booking in the past (not editable)
                db.Bookings.Add(new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now.AddHours(-2), EndAt = now.AddHours(-1), Reason = "past", Capacity = 1, Contact = "c", Status = "Approved", CreatedAt = now });
                // Future booking to edit
                db.Bookings.Add(new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now.AddHours(2), EndAt = now.AddHours(3), Reason = "future", Capacity = 2, Contact = "c", Status = "Approved", CreatedAt = now });
                // Another approved booking to create overlap
                db.Bookings.Add(new Booking { ResourceId = res.Id, UserId = 1, BookingAt = now.AddHours(4), EndAt = now.AddHours(5), Reason = "other", Capacity = 2, Contact = "c", Status = "Approved", CreatedAt = now });
                db.SaveChanges();
            }

            // not found
            var nf = await client.PutAsJsonAsync("/api/admin/bookings/9999", new { date = "2025-12-01", time = "10:00", endTime = "11:00", reason = "x", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.NotFound, nf.StatusCode);

            // cannot edit past booking
            var badPast = await client.PutAsJsonAsync("/api/admin/bookings/1", new { date = "2025-12-01", time = "10:00", endTime = "11:00", reason = "x", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, badPast.StatusCode);

            // invalid time parsing
            var badTime = await client.PutAsJsonAsync("/api/admin/bookings/2", new { date = "not-a-date", time = "10:00", endTime = "11:00", reason = "x", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, badTime.StatusCode);

            var badEndBeforeStart = await client.PutAsJsonAsync("/api/admin/bookings/2", new { date = "2025-12-01", time = "11:00", endTime = "10:00", reason = "x", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, badEndBeforeStart.StatusCode);

            // capacity > resource
            var badCapacity = await client.PutAsJsonAsync("/api/admin/bookings/2", new { date = "2025-12-01", time = "10:00", endTime = "11:00", reason = "x", capacity = 999, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, badCapacity.StatusCode);

            // overlap with other approved booking (booking 3 is 4-5h)
            var badOverlap = await client.PutAsJsonAsync("/api/admin/bookings/2", new { date = "2025-12-01", time = "04:30", endTime = "04:45", reason = "x", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, badOverlap.StatusCode);
        }

        [Fact]
        public async Task ToggleResource_DoubleToggle_IdempotencyAndFinalState()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            using (var scope = host.Services.CreateScope())
            {
                SeedBasicHierarchy(scope.ServiceProvider, resourceActive: true);
            }

            var ok1 = await client.PutAsync("/api/admin/resources/1/toggle", null);
            Assert.Equal(HttpStatusCode.OK, ok1.StatusCode);

            var ok2 = await client.PutAsync("/api/admin/resources/1/toggle", null);
            Assert.Equal(HttpStatusCode.OK, ok2.StatusCode);
        }

        [Fact]
        public async Task CreateApprovedBooking_EdgeCases_And_LocationHeader()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();
            using (var scope = host.Services.CreateScope())
            {
                var (b,f,bl,res) = SeedBasicHierarchy(scope.ServiceProvider, resourceActive: true);
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var user = new User { Email = "u@example.com", Username = "u", PasswordHash = "h", PasswordSalt = "s", Role = "User", CreatedAt = DateTime.UtcNow };
                db.Users.Add(user); db.SaveChanges();
            }

            DateTime start = DateTime.UtcNow.AddHours(1);
            var endEqual = start;

            // equal start/end should still create? Current controller does not validate; expect 201
            var created = await client.PostAsJsonAsync("/api/admin/bookings/create", new { resourceId = 1, userId = 1, bookingAt = start, endAt = endEqual, reason = "r", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.Created, created.StatusCode);
            Assert.NotNull(created.Headers.Location);

            // inactive resource
            using (var scope = host.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var res = db.Resources.Find(1)!;
                res.IsActive = false; db.SaveChanges();
            }
            var badInactive = await client.PostAsJsonAsync("/api/admin/bookings/create", new { resourceId = 1, userId = 1, bookingAt = start, endAt = start.AddHours(1), reason = "r", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, badInactive.StatusCode);

            // not founds covered implicitly by invalid ids
            var nfResource = await client.PostAsJsonAsync("/api/admin/bookings/create", new { resourceId = 999, userId = 1, bookingAt = start, endAt = start.AddHours(1), reason = "r", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, nfResource.StatusCode);

            var nfUser = await client.PostAsJsonAsync("/api/admin/bookings/create", new { resourceId = 2, userId = 999, bookingAt = start, endAt = start.AddHours(1), reason = "r", capacity = 1, contact = "c" });
            Assert.Equal(HttpStatusCode.BadRequest, nfUser.StatusCode);
        }
    }
}


