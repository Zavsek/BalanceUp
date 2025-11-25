using Backend.Constants;
using Backend.Data;
using Backend.Routes;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Minimal API setup: do NOT add MVC controllers
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddEntityFrameworkNpgsql()
    .AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
    );
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});
builder.Services.AddSingleton(provider =>
    new Supabase.Client(
        Constants.SupabaseUrl,
        Constants.SupabaseApiKey,
        new Supabase.SupabaseOptions
        {
            AutoRefreshToken = true,
            AutoConnectRealtime = false
        })
);

// Register services your endpoint handlers need
builder.Services.AddScoped<FirebaseAuthService>();
// Keep AuthController as a DI-resolved class (it's not used as MVC controller)
builder.Services.AddScoped<Backend.Controllers.AuthController>();

builder.Services.AddOpenApi();
builder.Services.AddAuthorization();
builder.Services.AddAuthentication().AddBearerToken();

var app = builder.Build();

// Map minimal API endpoints (explicit bindings inside RouteExtensions)
app.MapAuthEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
// No app.MapControllers() — all endpoints are mapped via minimal API
app.UseAuthorization();
app.UseCors("AllowAll");

app.Run();
