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
                if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                    return Results.BadRequest("Email and password are required!");
                if(await _context.Users.AnyAsync(u => u.Username == request.Username))
                    return Results.Conflict("Username already taken!");
                var firebaseUid = await _authService.RegisterAsync(request.Email, request.Password);
                var user = new User
                {
                    FirebaseUid = firebaseUid,
                    Username = request.Username,
                    Gender = Enum.Parse<Gender>(request.Gender),
                    ProfilePictureUrl = null,
                    CreatedAt = DateTime.Now,
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync(); 
                var spendingGoal = new SpendingGoal
                {
                    UserId = user.Id,
                };

                _context.SpendingGoals.Add(spendingGoal);
                await _context.SaveChangesAsync();

                return Results.Ok(new
                {
                    localId = user.Id,
                    username = user.Username,
                    profilePictureUrl = user.ProfilePictureUrl,
                    gender = user.Gender.ToString()
                });

            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
        public  async Task<IResult> LoginRequest(string Uid)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(Uid))
                    return Results.BadRequest("Firebase UID Needed");
                var user = await _context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == Uid);
                if (user == null)
                    return Results.NotFound("User not found");
                return Results.Ok(new
                { user.Id, user.Username, user.Gender,  user.ProfilePictureUrl, user.CreatedAt });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
    }
}