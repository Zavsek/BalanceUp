using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace Backend.Handlers
{
    public class UserHandler
    {
        private readonly AppDbContext _context;
        private readonly Supabase.Client _supabase;
  

        public UserHandler(AppDbContext context, Supabase.Client supabase)
        {
            _context = context;
            _supabase = supabase;

        }
        //User tasks
        public  async Task<IResult> UpdateUser(Guid id, HttpRequest _request)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return Results.NotFound("User not found");

                var form = await _request.ReadFormAsync();

                var username = form["username"].ToString();
                if (string.IsNullOrWhiteSpace(username))
                    return Results.BadRequest("username cannot be empty.");
                user.username = username;

                if (!Enum.TryParse<Gender>(form["gender"], out var gender))
                    return Results.BadRequest("Invalid gender value.");
                user.gender = gender;

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

                    var bucket = _supabase.Storage.From(Constants.Constants.SupabaseBucket);
                    var fileName = $"{Guid.NewGuid()}{ext}";

                    await bucket.Upload(bytes, fileName, new Supabase.Storage.FileOptions
                    {
                        Upsert = true
                    });

                    user.profilePictureUrl = bucket.GetPublicUrl(fileName);
                }

                await _context.SaveChangesAsync();

                return Results.Ok(new
                {
                    localId = user.id,
                    username = user.username,
                    profilePictureUrl = user.profilePictureUrl
                });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in User Controller " + ex.Message);
            }
        }
        public  async Task<IResult> GetUserById(Guid id)
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return TypedResults.NotFound("User not found");
                return TypedResults.Ok(user);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        public  async Task<IResult> GetUserByUsername(string username)
        {
            try
            {
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.username == username);
                if (user == null)
                    return TypedResults.NotFound("User not found");
                return TypedResults.Ok(user);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
         
        public  async Task<IResult> UploadProfilePic(Guid id, IFormFile file) 
        {
            try
            {
                var user = await _context.Users.FindAsync(id);
                if (user == null)
                    return TypedResults.NotFound("User not found");
                if (file != null && file.Length > 0)
                {
                    using var ms = new MemoryStream();
                    await file.CopyToAsync(ms);
                    var bytes = ms.ToArray();
                    var bucket = _supabase.Storage.From("profile-pictures");
                    var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";
                    await bucket.Upload(bytes, fileName, new Supabase.Storage.FileOptions { Upsert = true });
                    user.profilePictureUrl = bucket.GetPublicUrl(fileName);
                }
                await _context.SaveChangesAsync();
                return TypedResults.Ok(new
                {
                    localId = user.id,
                    username = user.username,
                    profilePictureUrl = user.profilePictureUrl
                });
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("Error in User Controller " + ex.Message);
            }
        }

        //-------------------------------------------------------
        //Friend request tasks
        public  async Task<IResult> SendFriendRequest(FriendRequestDto FriendRequest)
        {
            try
            {
                if (await _context.Users.FindAsync(FriendRequest.fromUserId, FriendRequest.toUserId) == null) return TypedResults.BadRequest("Users in request are not valid");
                var friendRequest = new FriendRequest
                {
                    fromUserId = FriendRequest.fromUserId,
                    toUserId = FriendRequest.toUserId,
                    sentAt = DateOnly.FromDateTime(DateTime.UtcNow)
                };
                await _context.FriendRequests.AddAsync(friendRequest);
                await _context.SaveChangesAsync();
                return TypedResults.Ok("Friend Request Sent");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        public  async Task<IResult> GetFriendRequests(Guid id)
        {
            try
            {
                var requests = await _context.FriendRequests
                    .Where(fr => fr.toUserId == id)
                    .Select(fr => new
                    {
                        fromUserId = fr.fromUserId,
                        toUserId = fr.toUserId,
                        sentAt = fr.sentAt
                    })
                    .ToListAsync();
                return TypedResults.Ok(requests);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        public  async Task<IResult> DeleteFriendRequest(Guid id)
        {
            try
            {
                var request = await _context.FriendRequests.FindAsync(id);
                if (request == null)
                    return TypedResults.NotFound("Friend request not found");
                _context.FriendRequests.Remove(request);
                await _context.SaveChangesAsync();
                return TypedResults.Ok("Friend request deleted");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        //-------------------------------------------------------
        //Friendship tasks
        public  async Task<IResult> GetFriends(Guid id)
        {
            try
            {
                var friends = await _context.Friendships
                    .Where(f => f.friend1FK == id || f.friend2FK == id)
                    .Select(f => new
                    {
                        friendId = f.friend1FK == id ? f.friend2FK : f.friend1FK,
                        friendsSince = f.friendsSince
                    })
                    .ToListAsync();
                return TypedResults.Ok(friends);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
        public  async Task<IResult> AddFriend(Guid requestId)
        {
            try
            {
                var Request = await _context.FriendRequests.FindAsync(requestId);
                if (Request == null) return TypedResults.BadRequest("Users in request are not valid");
                var Friendship = new Friendship
                {
                    friend1FK = Request.fromUserId,
                    friend2FK = Request.toUserId,
                    friendsSince = DateTime.UtcNow
                };
                await _context.Friendships.AddAsync(Friendship);
                _context.FriendRequests.Remove(Request);
                await _context.SaveChangesAsync();
                return TypedResults.Ok("Friendship created");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
        public  async Task<IResult> RemoveFriend(Guid userId, Guid friendId)
        {
            try
            {
                var friendship = await _context.Friendships
                    .FirstOrDefaultAsync(f => (f.friend1FK == userId && f.friend2FK == friendId) ||
                                              (f.friend1FK == friendId && f.friend2FK == userId));
                if (friendship == null)
                    return TypedResults.NotFound("Friendship not found");
                _context.Friendships.Remove(friendship);
                await _context.SaveChangesAsync();
                return TypedResults.Ok("Friend removed");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        internal async Task<IResult> GetPersonalDashboard(ClaimsPrincipal user)
        {
            try
            {
                var firebaseUid = user.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

                var internalUser = await _context.Users.FirstOrDefaultAsync(u => u.firebaseUid == firebaseUid);
                if (internalUser == null)
                    return TypedResults.NotFound("User not found");
                var now = DateTime.UtcNow;
                var today = now.Date;
                var tomorrow = today.AddDays(1);
                var firstOfMovingMonth = new DateTime(now.Year, now.Month, 1);

                var monthExpenses = await _context.Expenses
                    .Where(e => e.userId == internalUser.id && e.dateTime >= firstOfMovingMonth && e.dateTime < firstOfMovingMonth.AddMonths(1))
                    .ToListAsync();

                var dailySpent = await _context.Expenses
                    .Where(e => e.userId == internalUser.id && e.dateTime >= today && e.dateTime < tomorrow)
                    .SumAsync(e => e.amount);

                var monthlySpent = await _context.Expenses
                    .Where(e => e.userId == internalUser.id && e.dateTime >= firstOfMovingMonth && e.dateTime < firstOfMovingMonth.AddMonths(1))
                    .SumAsync(e => e.amount);

                var recentExpenses = await _context.Expenses
                    .Where(e => e.userId == internalUser.id)
                    .OrderByDescending(e => e.dateTime)
                    .Take(5)
                    .ToListAsync();
                List<RecentExpensesDto> recentExpensesDto;

                if (recentExpenses != null && recentExpenses.Count > 0)
                {
                    recentExpensesDto = recentExpenses
                        .Select(x => new RecentExpensesDto(
                            x.description,
                            x.amount,
                            x.type.ToString()
                        ))
                        .ToList();
                }
                else
                {
                    recentExpensesDto = new List<RecentExpensesDto>();
                }
                return Results.Ok(new DashboardDto(dailySpent, internalUser.spendingGoal.dailyLimit, monthlySpent, internalUser.spendingGoal.monthlyLimit, recentExpensesDto));
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        internal async Task<IResult> DeletePersonalUser(ClaimsPrincipal user)
        {
            try
            {
                var firebaseUid = user.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

                var internalUser = await _context.Users.FirstOrDefaultAsync(u => u.firebaseUid == firebaseUid);
                if (internalUser == null)
                    return TypedResults.NotFound("User not found");
                _context.Users.Remove(internalUser);
                await _context.SaveChangesAsync();
                return TypedResults.NoContent();
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
    }
}
