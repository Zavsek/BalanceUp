using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Security.Claims;

namespace Backend.Handlers
{

    public class AuthHandler
    {
        private readonly FirebaseAuthService _authService;
        private readonly AppDbContext _context;

        public AuthHandler(FirebaseAuthService authService, AppDbContext context)
        {
            _authService = authService;
            _context = context;

        }
        public  async Task<IResult> Register(AuthRequestDto request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.email) || string.IsNullOrWhiteSpace(request.password))
                    return Results.BadRequest("Email and password are required!");

                if (await _context.Users.AnyAsync(u => u.username == request.username))
                    return Results.Conflict("Username already taken!");

                string? firebaseUid = null;
                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {

                    firebaseUid = await _authService.RegisterAsync(request.email, request.password);


                    var user = new User
                    {
                        firebaseUid = firebaseUid,
                        username = request.username,
                        gender = Enum.Parse<Gender>(request.gender),
                        createdAt = DateTime.UtcNow,
                    };

                    _context.Users.Add(user);

                    _context.SpendingGoals.Add(new SpendingGoal { user = user });


                    await _context.SaveChangesAsync();


                    await transaction.CommitAsync();

                    var customToken = await FirebaseAuth.DefaultInstance.CreateCustomTokenAsync(firebaseUid);

                    return Results.Ok(new
                    {
                        token = customToken,
                        localId = user.id,
                        username = user.username,
                        gender = user.gender.ToString()
                    });
                }
                catch (Exception ex)
                {
                    if (!string.IsNullOrEmpty(firebaseUid)
                    {
                        await _authService.DeleteUserAsync(firebaseUid);
                    }

                    
                    return Results.InternalServerError("Registration failed: " + ex.Message);
                }
            
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
        public async Task<IResult> LoginRequest(ClaimsPrincipal userClaims)
        {
            try
            {
                var firebaseUid = userClaims.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

                if (string.IsNullOrEmpty(firebaseUid)){
                    return Results.Unauthorized();
                }
                var user = await _context.Users.FirstOrDefaultAsync(u => u.firebaseUid == firebaseUid);
                if (user == null)
                    return Results.NotFound("User not found. please register or try again later");
                return Results.Ok(new {
                    user.id,
                    user.username,
                    user.gender,
                    user.profilePictureUrl,
                    user.createdAt
                });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
    }
}