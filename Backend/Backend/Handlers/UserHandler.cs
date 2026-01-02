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
        private readonly IHttpContextAccessor _httpContextAccessor;


        public UserHandler(AppDbContext context, Supabase.Client supabase, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _supabase = supabase;
            _httpContextAccessor = httpContextAccessor;

        }
        //User tasks
        public  async Task<IResult> UpdateUserInfo(UserDto user)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();
                var existingUser =  await _context.Users.FirstOrDefaultAsync(u => u.id == userId);
                if (existingUser == null)
                {
                    return Results.NotFound("user not found");
                }
                existingUser.username = user.username;
                existingUser.gender = Enum.Parse<Gender>(user.gender);

                await _context.SaveChangesAsync();
                return Results.Ok("Succesfully updated");
                
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
                var userCard = await _context.Users
                    .Where(u => u.id == id)
                    .Select(u => new UserCardDto(
                        u.id,
                        u.username,
                        u.profilePictureUrl,
                        u.gender.ToString())
                    ).FirstOrDefaultAsync();
                return TypedResults.Ok(userCard);
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
                var userCard = await _context.Users
                    .Where(u => u.username.ToLower().Contains(username.ToLower()))
                    .Select(u=> new UserCardDto(
                        u.id,
                        u.username,
                        u.profilePictureUrl,
                        u.gender.ToString())
                    ).ToListAsync();
                return TypedResults.Ok(userCard);
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
        public  async Task<IResult> SendFriendRequest(Guid toUserId)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();

                if (userId == toUserId)
                    return TypedResults.BadRequest("You cannot send a friend request to yourself.");

                if (await _context.Users.FindAsync(toUserId) == null)
                    return TypedResults.BadRequest("User not found.");

                var existingRequest = await _context.FriendRequests
                    .AnyAsync(fr => (fr.fromUserId == userId && fr.toUserId == toUserId) ||
                                    (fr.fromUserId == toUserId && fr.toUserId == userId));

                if (existingRequest)
                    return TypedResults.BadRequest("A friend request is already pending.");

                var areFriends = await _context.Friendships
                       .AnyAsync(f => (f.friend1FK == userId && f.friend2FK == toUserId) ||
                       (f.friend1FK == toUserId && f.friend2FK == userId));
                if (areFriends)
                    return TypedResults.BadRequest("You are already friends with this user.");

                var friendRequest = new FriendRequest
                    {
                        fromUserId = userId.Value,
                        toUserId = toUserId,
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
        public async Task<IResult> GetNumberOfPendingFriendRequests()
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();
                var numberOfPendingRequests = await _context.FriendRequests.Where(fr => fr.toUserId == userId)
            .CountAsync();
                return TypedResults.Ok(new{count =  numberOfPendingRequests});
            }
            catch(Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }

        public  async Task<IResult> GetFriendRequests()
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();
                var incomingRequests = await _context.FriendRequests
            .Where(fr => fr.toUserId == userId)
            .Select(fr => new IncomingFriendRequestsDto(
                fr.id,
                fr.fromUserId,
                fr.sentAt, 
                new UserCardDto(
                    fr.fromUser.id,
                    fr.fromUser.username,
                    fr.fromUser.profilePictureUrl,
                    fr.fromUser.gender.ToString()
                )
            ))
            .ToListAsync();
                return TypedResults.Ok(incomingRequests);
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
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();
                var request = await _context.FriendRequests.FindAsync(id);
                if (request == null)
                    return TypedResults.NotFound("Friend request not found");
                if (request.toUserId != userId) return Results.BadRequest("This request was rejeted by the wrong user");
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
        public  async Task<IResult> GetFriends()
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();

                var friends = await _context.Friendships
                    .Where(f => f.friend1FK == userId || f.friend2FK == userId)
                    .Select(f => new {
                        FriendshipId = f.id,
                        FriendData = f.friend1FK == userId ? f.friend2 : f.friend1
                    })
                    .Select(x => new FriendsDto(
                        x.FriendshipId,
                        x.FriendData.id,
                        x.FriendData.username,
                        x.FriendData.profilePictureUrl,
                        x.FriendData.gender.ToString()
                    ))
                    .ToListAsync();

                return TypedResults.Ok(friends);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error: {ex.Message}");
            }
        }
        public  async Task<IResult> AddFriend(Guid requestId)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();

                var request = await _context.FriendRequests.FindAsync(requestId);
                if (request == null) return TypedResults.BadRequest("request not found");
                if (request.toUserId != userId) return Results.BadRequest("This request was accepted by the wrong user");
                var Friendship = new Friendship
                {
                    friend1FK = request.fromUserId,
                    friend2FK = request.toUserId,
                    friendsSince = DateTime.UtcNow
                };
                await _context.Friendships.AddAsync(Friendship);
                _context.FriendRequests.Remove(request);
                await _context.SaveChangesAsync();
                return TypedResults.Ok("Friendship created");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error in User Controller {ex.Message}");
            }
        }
        public  async Task<IResult> RemoveFriend(Guid friendshipId)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null)
                    return TypedResults.Unauthorized();

                var friendship = await _context.Friendships
                    .FirstOrDefaultAsync(f => f.id == friendshipId);

                if (friendship == null)
                    return TypedResults.NotFound("Friendship not found");

                if (friendship.friend1FK != userId && friendship.friend2FK != userId)
                    return TypedResults.Forbid(); 

                _context.Friendships.Remove(friendship);
                await _context.SaveChangesAsync();

                return TypedResults.Ok("Friend removed");
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError($"Error: {ex.Message}");
            }
        }

        internal async Task<IResult> GetPersonalDashboard(ClaimsPrincipal user)
        {
            try
            {
                var firebaseUid = user.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

                var internalUser = await _context.Users.Include(u => u.spendingGoal).FirstOrDefaultAsync(u => u.firebaseUid == firebaseUid);
                if (internalUser == null)
                    return TypedResults.NotFound("User not found");
                var now = DateTime.UtcNow;
                var today = now.Date;
                var sevenDaysAgo = DateTime.UtcNow.AddDays(-7);
                var tomorrow = today.AddDays(1);
                var firstOfMovingMonth = new DateTime(now.Year, now.Month, 1, 0, 0, 0, DateTimeKind.Utc);

                var monthExpenses = await _context.Expenses
                    .Where(e => e.userId == internalUser.id && e.dateTime >= firstOfMovingMonth && e.dateTime < firstOfMovingMonth.AddMonths(1))
                    .ToListAsync();

                var dailySpent = await _context.Expenses
                    .Where(e => e.userId == internalUser.id && e.dateTime >= today && e.dateTime < tomorrow)
                    .SumAsync(e => e.amount);
                var weeklySpent = await _context.Expenses
                    .Where(e => e.userId == internalUser.id && e.dateTime >= sevenDaysAgo)
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
                return Results.Ok(new DashboardDto(dailySpent, internalUser.spendingGoal.dailyLimit, weeklySpent, internalUser.spendingGoal.weeklyLimit, monthlySpent, internalUser.spendingGoal.monthlyLimit, recentExpensesDto));
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
