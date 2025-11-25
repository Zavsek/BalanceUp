using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;

namespace Backend.Routes
{
    public static class AuthEndpoints 
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            // Auth Endpoints
            // POST register
            app.MapPost("/api/register", async ([FromBody] AuthRequestDto request, [FromServices] AuthController controller) =>
            {
                return await controller.Register(request);
            });

            // POST login 
            app.MapPost("/api/login", async ([FromBody] string Uid, [FromServices] AuthController controller) =>
            {
                return await controller.LoginRequest(Uid);
            });
        }
    }
}
