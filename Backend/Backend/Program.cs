using Backend.Data;
using Microsoft.EntityFrameworkCore;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using FirebaseAdmin.Auth;
using Backend.Constants;
var builder = WebApplication.CreateBuilder(args);


builder.Services.AddControllers();

FirebaseApp.Create(new AppOptions()
{
    Credential = GoogleCredential.FromFile( "firebase-config.json"),
    ProjectId = "\r\nbalanceup-85fcc"
});
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddEntityFrameworkNpgsql()
    .AddDbContext<AppDbContext>(options =>
        options.UseNpgsql(builder.Configuration.GetConnectionString("Default"))
    );

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

builder.Services.AddOpenApi();

var app = builder.Build();


if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();



app.MapControllers();

app.Run();
