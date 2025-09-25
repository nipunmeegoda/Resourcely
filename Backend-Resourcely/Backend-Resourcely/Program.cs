using Backend_Resourcely.Data;
using Backend_Resourcely.Helpers;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core MySQL
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// CORS for Vite dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5174", "http://localhost:5175")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// --- Command line admin creation ---
if (args.Length > 0 && args[0].ToLower() == "create-admin")
{
    // Parse command-line arguments
    var emailArg = args.FirstOrDefault(a => a.StartsWith("--email"));
    var passwordArg = args.FirstOrDefault(a => a.StartsWith("--password"));

    var email = emailArg?.Split('=')[1];
    var password = passwordArg?.Split('=')[1];

    // Validate input
    if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
    {
        Console.WriteLine("Please provide both --email and --password arguments.");
        return;
    }

    // Create a DI scope to get the DbContext
    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await AdminCreator.CreateAdminUser(dbContext, email, password, password);
    }

    // Exit after command execution
    return;
}

// --- Initialize database (raw SQL, no EnsureCreated) ---
using (var scope = app.Services.CreateScope())
{
    var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
    await DatabaseInitializer.InitializeDatabase(configuration);
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors();
app.UseAuthorization();
app.MapControllers();

await app.RunAsync();
