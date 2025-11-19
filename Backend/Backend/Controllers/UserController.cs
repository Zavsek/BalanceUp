
using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    public class UserController
    {
        public static async Task<IResult> UpdateUser(Guid id,
        HttpRequest request,
        AppDbContext context,
        Supabase.Client supabase)
        {
            try
            {
                var user = await context.Users.FindAsync(id);
                if (user == null)
                    return Results.NotFound("User not found");

                var form = await request.ReadFormAsync();

                var username = form["username"].ToString();
                if (string.IsNullOrWhiteSpace(username))
                    return Results.BadRequest("Username cannot be empty.");
                user.Username = username;

                if (!Enum.TryParse<Gender>(form["gender"], out var gender))
                    return Results.BadRequest("Invalid gender value.");
                user.Gender = gender;

                var file = form.Files.GetFile("profilePicture");
                if (file != null && file.Length > 0)
                {
                    var allowedTypes = new[] { ".png", ".jpg", ".jpeg" };
                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
                    if (!allowedTypes.Contains(ext))
                        return Results.BadRequest("Only PNG/JPG files are allowed.");

                    using var ms = new MemoryStream();
                    await file.CopyToAsync(ms);
                    var bytes = ms.ToArray();

                    var bucket = supabase.Storage.From(Constants.Constants.SupabaseBucket);
                    var fileName = $"{Guid.NewGuid()}{ext}";

                    await bucket.Upload(bytes, fileName, new Supabase.Storage.FileOptions
                    {
                        Upsert = true
                    });

                    user.ProfilePictureUrl = bucket.GetPublicUrl(fileName);
                }

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
                return TypedResults.InternalServerError("Error in User Controller " + ex.Message);
            }
        }
        public static async Task<IResult> SendFriendRequest(FriendRequestDto FriendRequest, AppDbContext context)
        {
            try
            {
                if (await context.Users.FindAsync(FriendRequest.fromUserId, FriendRequest.toUserId) == null) return TypedResults.BadRequest("Users in request are not valid");
                var friendRequest = new FriendRequest
                {
                    FromUserId = FriendRequest.fromUserId,
                    ToUserId = FriendRequest.toUserId,
                    SentAt = DateOnly.FromDateTime(DateTime.UtcNow)
                };
                await context.FriendRequests.AddAsync(friendRequest);
                context.SaveChangesAsync();
                return TypedResults.Ok("Friend Request Sent");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        public static async Task<IResult> GetFriendRequests(Guid id, AppDbContext context)
        {
            try
            {
                var requests = await context.FriendRequests
                    .Where(fr => fr.ToUserId == id)
                    .Select(fr => new
                    {
                        fromUserId = fr.FromUserId,
                        toUserId = fr.ToUserId,
                        sentAt = fr.SentAt
                    })
                    .ToListAsync();
                return TypedResults.Ok(requests);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        public static async Task<IResult> DeleteFriendRequest(Guid id, AppDbContext context)
        {
            try
            {
                var request = await context.FriendRequests.FindAsync(id);
                if (request == null)
                    return TypedResults.NotFound("Friend request not found");
                context.FriendRequests.Remove(request);
                await context.SaveChangesAsync();
                return TypedResults.Ok("Friend request deleted");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
        public static async Task<IResult> GetFriends(Guid id, AppDbContext context)
        {
            try
            {
                var friends = await context.Friendships
                    .Where(f => f.Friend1FK == id || f.Friend2FK == id)
                    .Select(f => new
                    {
                        friendId = f.Friend1FK == id ? f.Friend2FK : f.Friend1FK,
                        friendsSince = f.FriendsSince
                    })
                    .ToListAsync();
                return TypedResults.Ok(friends);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
        public static async Task<IResult> AddFriend([FromQuery] Guid requestId, AppDbContext context)
        {
            try
            {
                var Request = await context.FriendRequests.FindAsync(requestId);
                if (Request == null) return TypedResults.BadRequest("Users in request are not valid");
                var Friendship = new Friendship
                {
                    Friend1FK = Request.FromUserId,
                    Friend2FK = Request.ToUserId,
                    FriendsSince = DateTime.UtcNow
                };
                await context.Friendships.AddAsync(Friendship);
                context.FriendRequests.Remove(Request);
                await context.SaveChangesAsync();
                return TypedResults.Ok("Friendship created");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
        public static async Task<IResult> RemoveFriend(Guid userId, Guid friendId, AppDbContext context)
        {
            try
            {
                var friendship = await context.Friendships
                    .FirstOrDefaultAsync(f => (f.Friend1FK == userId && f.Friend2FK == friendId) ||
                                              (f.Friend1FK == friendId && f.Friend2FK == userId));
                if (friendship == null)
                    return TypedResults.NotFound("Friendship not found");
                context.Friendships.Remove(friendship);
                await context.SaveChangesAsync();
                return TypedResults.Ok("Friend removed");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
    }
}
