using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
using System.Security.Claims;
using Backend.Handlers;
namespace Backend.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this WebApplication app)
        {
            var UserGroup = app.MapGroup("/apis/users")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");

            //GET get sender user details via JWT
            UserGroup.MapGet("/dashboard", async (UserHandler handler, ClaimsPrincipal user) =>
            {
                return await handler.GetPersonalDashboard(user);
            });

            //DELETE delete sender via JWT
            UserGroup.MapDelete("/me", async(UserHandler handler, ClaimsPrincipal user) => {  return await handler.DeletePersonalUser(user); });
            //PUT update user
            UserGroup.MapPut("/{id}", async(Guid id,  UserHandler handler, HttpRequest request) =>
            {
                return await handler.UpdateUser(id, request );
            });
            //GET user by id
            UserGroup.MapGet("/find-by-id/{id}", async ( Guid id,  UserHandler handler) =>
            {
                return await handler.GetUserById(id);
            });
            //GET user by username
            UserGroup.MapGet("/find-by-username/{username}", async ( string username,  UserHandler handler) =>
            {
                return await handler.GetUserByUsername(username);
            });
            //POST upload profile picture
            UserGroup.MapPost("/{id}/profile_pic", async ( Guid id, IFormFile file,  UserHandler handler) =>
            {
                return await handler.UploadProfilePic(id, file);
            });

            //------------------------------------------
            // Friend Requests Endpoints
            //PUT send friend request
            UserGroup.MapPut("/friend_requests", async ( FriendRequestDto request,  UserHandler handler) => { return await handler.SendFriendRequest(request); });
            //GET friend requests for user
            UserGroup.MapGet("/{id}/friend_requests", async ( Guid id,  UserHandler handler) => { return await handler.GetFriendRequests(id); });
            //DELETE friend request
            UserGroup.MapDelete("/friend_requests/{requestId}", async ( Guid id,  UserHandler handler) =>
            {
                return await handler.DeleteFriendRequest(id);
            });
            //POST accept friend request
            UserGroup.MapPost("/friend_requests/{requestId}", async ( Guid requestId,  UserHandler handler) => { return await handler.AddFriend(requestId); });

            //--------------------------------------------
            //Friends Endpoints
            //GET friends for user
            UserGroup.MapGet("/{id}/friends", async (Guid id,  UserHandler handler) => { return await handler.GetFriends(id); });
            //DELETE remove friend
            UserGroup.MapDelete("/{userId}/friends/{friendId}", async ( Guid userId, Guid friendId,  UserHandler handler) =>
            {
                return await handler.RemoveFriend(userId, friendId);
            });

        }

    }
}
