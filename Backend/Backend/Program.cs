using Backend.Constants;
using Backend.Data;
using Backend.Routes;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowExpo", policy =>
    {
        policy.WithOrigins(
                "http://localhost:19006",
                "http://127.0.0.1:19006",
                "http://localhost:19000",
                "http://127.0.0.1:19000",
                "http://10.0.2.2:19006",
                "http://10.0.2.2:19000"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });

    options.AddPolicy("AllowAll", builder =>
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader());
});
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

builder.Services.AddScoped<FirebaseAuthService>();
builder.Services.AddScoped<Backend.Controllers.AuthController>();

builder.Services.AddOpenApi();
builder.Services.AddAuthorization();
builder.Services.AddAuthentication().AddBearerToken();

builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

var app = builder.Build();

app.MapAuthEndpoints();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.UseCors("AllowExpo");

app.Run();
