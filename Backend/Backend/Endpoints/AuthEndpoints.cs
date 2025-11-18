using Backend.Data;
using Backend.Models;
using Backend.Controllers;

namespace Backend.Routes
{
    public static class AuthEndpoints 
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            app.MapPost("/api/register",AuthController.Register);

            app.MapGet("/api/login", AuthController.Login); 



        }
    }
}
