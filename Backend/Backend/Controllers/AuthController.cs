using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;

namespace Backend.Controllers
{

    public class AuthController
    {
        private readonly FirebaseAuthService _authService;
        private readonly AppDbContext _context;

        public AuthController(FirebaseAuthService authService, AppDbContext context)
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
                if(await _context.Users.AnyAsync(u => u.username == request.username))
                    return Results.Conflict("Username already taken!");
                var firebaseUid = await _authService.RegisterAsync(request.email, request.password);
                var user = new User
                {
                    firebaseUid = firebaseUid,
                    username = request.username,
                    gender = Enum.Parse<Gender>(request.gender),
                    profilePictureUrl = null,
                    createdAt = DateTime.Now,
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(); 
                var spendingGoal = new SpendingGoal
                {
                    userId = user.id,
                };

                _context.SpendingGoals.Add(spendingGoal);
                await _context.SaveChangesAsync();

                return Results.Ok(new
                {
                    localId = user.id,
                    username = user.username,
                    profilePictureUrl = user.profilePictureUrl,
                    gender = user.gender.ToString()
                });

            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
        public  async Task<IResult> LoginRequest(string uuid)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(uuid))
                    return Results.BadRequest("Firebase UID Needed");
                var user = await _context.Users.FirstOrDefaultAsync(u => u.firebaseUid == uuid);
                if (user == null)
                    return Results.NotFound("User not found");
                return Results.Ok(new
                { user.id, user.username, user.gender,  user.profilePictureUrl, user.createdAt });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
    }
}