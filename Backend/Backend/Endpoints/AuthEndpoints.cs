using Backend.Handlers;
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
            app.MapPost("/api/users/register", async ( AuthRequestDto request, AuthHandler handler) =>
            {
                return await handler.Register(request);
            });

            // POST login 
            app.MapPost("/api/users/login", async (ClaimsPrincipal user,  AuthHandler handler) =>
            {
                return await handler.LoginRequest(user);

            }).RequireAuthorization();
        }
    }
}
