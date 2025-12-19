using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Backend.Routes
{
    public static class AuthEndpoints 
    {
        public static void MapAuthEndpoints(this WebApplication app)
        {
            // Auth Endpoints
            // POST register
            app.MapPost("/api/users/register", async ( AuthRequestDto request, [FromServices] AuthController controller) =>
            {
                return await controller.Register(request);
            });

            // POST login 
            app.MapPost("/api/users/login", async (ClaimsPrincipal user, [FromServices] AuthController controller) =>
            {
                return await controller.LoginRequest(user);

            }).RequireAuthorization();
        }
    }
}
