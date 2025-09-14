using Backend_Resourcely.Data;
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

// Add Identity
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()  //tells Identity to store users, roles, claims, etc., in my database
.AddDefaultTokenProviders();  //Adds built-in token generation for things like: Email confirmation links ,Password reset links ,Two-factor authentication



// CORS for Vite dev server
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

// Initialize roles and admin user  WHY THIS -- becouse hen the app runs for the first time, don’t have to manually create roles or the first admin. auto makes it 
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;  // add scppe for DI 
    await InitializeRolesAndAdmin(services);
}

app.MapGet("/", () => "Hello World! Backend is working! 🎉");

// Ensure DB exists (dev)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

async Task InitializeRolesAndAdmin(IServiceProvider serviceProvider)
{
    var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();    //to manage  role a tool  like thing
    var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();   //to manage users a tool 

    // Create roles
    string[] roleNames = { "Admin", "Manager", "User" };  // all roles i will be using 
    foreach (var roleName in roleNames)
    {
        var roleExist = await roleManager.RoleExistsAsync(roleName);
        if (!roleExist)  // if to see if the role is made or not 
        {
            await roleManager.CreateAsync(new IdentityRole(roleName)); //if not create it 
        }
    }

    // Create admin user
    var adminUser = await userManager.FindByEmailAsync("admin@example.com");
    if (adminUser == null)
    {
        var user = new ApplicationUser    // defult admin user 
        {
            UserName = "admin@example.com",
            Email = "admin@example.com",
            FirstName = "Admin",
            LastName = "User",
            EmailConfirmed = true
        };
        
        var createPowerUser = await userManager.CreateAsync(user, "Admin@123");
        if (createPowerUser.Succeeded)                                                // ceack if admin is alrady made or not 
        {
            await userManager.AddToRoleAsync(user, "Admin");                            //if not make him 
        }
    }
}