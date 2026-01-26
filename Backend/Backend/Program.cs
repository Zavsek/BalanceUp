using Backend.Constants;
using Backend.Data;
using Backend.Endpoints;
using Backend.Hubs;
using Backend.Middleware;
using Backend.Routes;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);


//CORS Expo
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
});

builder.Services.AddEndpointsApiExplorer();

//DB
builder.Services.AddEntityFrameworkNpgsql()
    .AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
    );

//CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

//SupaBase
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
builder.Services.AddSignalR();

//Firebase JWT middleware
var firebaseProjectId = builder.Configuration["Firebase:Firebase__ProjectId"];
string issuer = $"https://securetoken.google.com/{firebaseProjectId}";

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = issuer;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = issuer,
            ValidateAudience = true,
            ValidAudience = firebaseProjectId,
            ValidateLifetime = true
        };
        });

builder.Services.AddAuthorization();


//RateLimiter
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddPolicy("user_limit", httpContext =>
    {
        var userKey = httpContext.User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value
                      ?? httpContext.Connection.RemoteIpAddress?.ToString()
                      ?? "anonymous";

        return RateLimitPartition.GetFixedWindowLimiter(userKey, _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 30,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        });
    });
});


builder.Services.AddHttpContextAccessor();



builder.Services.AddScoped<FirebaseAuthService>();
builder.Services.AddScoped<Backend.Handlers.AuthHandler>();
builder.Services.AddScoped<Backend.Handlers.UserHandler>();
builder.Services.AddScoped<Backend.Handlers.EventHandler>();
builder.Services.AddScoped<Backend.Handlers.UserEventsHandler>();
builder.Services.AddScoped<Backend.Handlers.ExpenseHandler>();
builder.Services.AddScoped<Backend.Handlers.SpendingGoalsHandler>();

builder.Services.AddOpenApi();
builder.Services.AddAuthorization();

builder.Services.ConfigureHttpJsonOptions(opts =>
{
    opts.SerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    opts.SerializerOptions.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
});

var app = builder.Build();

//app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();
app.UseMiddleware<UserMappingMiddleware>();
app.MapAuthEndpoints();
app.UseRateLimiter();
app.MapUserEndpoints();
app.MapExpenseEndpoints();
app.MapGoalEndpoints();
app.MapUserEventsEndpoints();
app.MapEventEndpoints();
app.MapHub<EventHub>("/eventHub");

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthorization();

app.Run("http://0.0.0.0:5245");
