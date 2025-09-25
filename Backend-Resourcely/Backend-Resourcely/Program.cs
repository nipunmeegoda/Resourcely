using Backend_Resourcely.Data;
using Backend_Resourcely.Helpers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS support for frontend (React + Vite)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3000", "http://localhost:5173")
            .AllowAnyHeader()
            .AllowAnyMethod());
});

var app = builder.Build();

// Custom CLI command: create-admin
if (args.Length > 0 && args[0].ToLower() == "create-admin")
{
    var emailArg = args.FirstOrDefault(a => a.StartsWith("--email"));
    var passwordArg = args.FirstOrDefault(a => a.StartsWith("--password"));

    var email = emailArg?.Split('=')[1];
    var password = passwordArg?.Split('=')[1];

    if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
    {
        Console.WriteLine("Please provide both --email and --password arguments.");
        return;
    }

    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await AdminCreator.CreateAdminUser(dbContext, email, password, password);
    }

    return; // exit after creating admin
}

// Initialize database with raw SQL scripts (instead of EnsureCreated)
using (var scope = app.Services.CreateScope())
{
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    await DatabaseInitializer.InitializeDatabase(configuration);
}

// Configure middleware
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection(); // optional if running with SSL locally

app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
