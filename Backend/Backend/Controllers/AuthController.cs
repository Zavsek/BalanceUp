using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    public static class AuthController
    {

        public static async Task<IResult> Register(HttpRequest request,
                FirebaseAuthService authService,
                AppDbContext context,
                Supabase.Client supabase)
        {
            try
            {
                var form = await request.ReadFormAsync();

                var email = form["email"].ToString();
                var password = form["password"].ToString();
                var username = form["username"].ToString();
                var gender = Enum.Parse<Gender>(form["gender"].ToString());

                var file = form.Files.GetFile("profilePicture"); 

                if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
                    return Results.BadRequest("Email in geslo obvezna.");

                var firebaseUid = await authService.RegisterAsync(email, password);

                string? profileUrl = null;

                if (file != null && file.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await file.CopyToAsync(ms);
                    var bytes = ms.ToArray();

                    var bucket = supabase.Storage.From("profile-pictures");
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

                    await bucket.Upload(bytes, fileName, new Supabase.Storage.FileOptions { Upsert = true });

                    profileUrl = bucket.GetPublicUrl(fileName);
                }
                var user = new User
                {
                    FirebaseUid = firebaseUid,
                    Username = username,
                    Gender = gender,
                    ProfilePictureUrl = profileUrl,
                    Expenses = new List<Expense>(),
                    UserEvents = new List<UserEvents>()
                };

                var spendingGoal = new SpendingGoal
                {
                    UserId = user.Id,
                };
                context.Users.Add(user);
                await context.SaveChangesAsync();

                return Results.Ok(new
                {
                    localId = user.Id,
                    username = user.Username,
                    profilePictureUrl = user.ProfilePictureUrl
                });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
        public static async Task<IResult> Login(LoginRequest request, AppDbContext context)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.FirebaseUid))
                    return Results.BadRequest("Firebase UID Needed");
                var user = await context.Users.FirstOrDefaultAsync(u => u.FirebaseUid == request.FirebaseUid);
                if (user == null)
                    return Results.NotFound("User not found");
                return Results.Ok(new UserDto
                (user.Id, user.Username, user.Gender, user.ProfilePictureUrl));
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in AuthController "+ ex.Message);
            }
        }
    }
}