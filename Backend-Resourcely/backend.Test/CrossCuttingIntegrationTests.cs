using System.Net;
using System.Net.Http.Json;
using System.Text;
using Backend_Resourcely.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace backend.Test
{
    public class CrossCuttingIntegrationTests
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
                            .AddApplicationPart(typeof(Backend_Resourcely.Controllers.UserController).Assembly);

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

        [Fact]
        public async Task Routing_ModelBinding_BasicEndpointsReachable()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();

            var r1 = await client.GetAsync("/api/user");
            Assert.Equal(HttpStatusCode.OK, r1.StatusCode);

            var r2 = await client.GetAsync("/api/buildings");
            Assert.Equal(HttpStatusCode.OK, r2.StatusCode);

            var r3 = await client.GetAsync("/api/department");
            Assert.Equal(HttpStatusCode.OK, r3.StatusCode);
        }

        [Fact]
        public async Task DataAnnotations_LengthLimits_Return400()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();
            string over200 = new string('a', 201);
            string over500 = new string('b', 501);

            var resp1 = await client.PostAsJsonAsync("/api/department", new { name = over200, description = "x" });
            Assert.Equal(HttpStatusCode.BadRequest, resp1.StatusCode);

            var resp2 = await client.PostAsJsonAsync("/api/department", new { name = "Valid", description = over500 });
            Assert.Equal(HttpStatusCode.BadRequest, resp2.StatusCode);
        }

        [Fact]
        public async Task MalformedJson_And_UnsupportedMediaType()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();
            var malformed = new StringContent("{ invalid", Encoding.UTF8, "application/json");
            var r1 = await client.PostAsync("/api/department", malformed);
            Assert.Equal(HttpStatusCode.BadRequest, r1.StatusCode);

            var wrongType = new StringContent("name=CS", Encoding.UTF8, "text/plain");
            var r2 = await client.PostAsync("/api/department", wrongType);
            Assert.Equal(HttpStatusCode.UnsupportedMediaType, r2.StatusCode);
        }

        [Fact]
        public async Task NegativeIds_And_EmptyBodies()
        {
            using var host = CreateHost(Guid.NewGuid().ToString());
            var client = host.GetTestClient();
            var neg = await client.GetAsync("/api/buildings/-1");
            Assert.Equal(HttpStatusCode.NotFound, neg.StatusCode);

            var emptyBody = new StringContent(string.Empty, Encoding.UTF8, "application/json");
            var empty = await client.PostAsync("/api/department", emptyBody);
            Assert.Equal(HttpStatusCode.BadRequest, empty.StatusCode);
        }

        [Fact(Skip = "Auth/role tests pending: no authorization configured yet")]
        public async Task AuthRole_Tests_Placeholder()
        {
            await Task.CompletedTask;
        }
    }
}


