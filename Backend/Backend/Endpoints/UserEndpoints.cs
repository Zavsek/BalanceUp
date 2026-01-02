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
            var UserGroup = app.MapGroup("/api/users")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");

            //GET gets user dashboard
            // returns user daily + montly spent + limit and lst 5 tranactions
            UserGroup.MapGet("/dashboard", async (UserHandler handler, ClaimsPrincipal user) =>
            {
                return await handler.GetPersonalDashboard(user);
            });

            //DELETE delete sender via JWT
            UserGroup.MapDelete("/me", async(UserHandler handler, ClaimsPrincipal user) => {  return await handler.DeletePersonalUser(user); });
            //PUT update user
            UserGroup.MapPut("/", async(UserDto user, UserHandler handler) =>
            {
                return await handler.UpdateUserInfo(user);
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
            UserGroup.MapPost("/friend-requests/{id}", async (Guid id,  UserHandler handler) => { return await handler.SendFriendRequest(id); });
            //GET friend requests for user
            UserGroup.MapGet("/friend-requests", async ( UserHandler handler) => { return await handler.GetFriendRequests(); });
            //GET return number of pending friend requests
            UserGroup.MapGet("/friend-requests/count", async(UserHandler handler) => { return await handler.GetNumberOfPendingFriendRequests(); });
            //DELETE friend request
            UserGroup.MapDelete("/friend-requests/reject/{requestId}", async ( Guid id,  UserHandler handler) =>
            {
                return await handler.DeleteFriendRequest(id);
            });
            //POST accept friend request
            UserGroup.MapPost("/friend-requests/add/{requestId}", async ( Guid requestId,  UserHandler handler) => { return await handler.AddFriend(requestId); });

            //--------------------------------------------
            //Friends Endpoints
            //GET friends for user
            UserGroup.MapGet("/friends", async (UserHandler handler) => { return await handler.GetFriends(); });
            //DELETE remove friend
            UserGroup.MapDelete("friends/{friendshipId}", async ( Guid friendshipId,  UserHandler handler) =>
            {
                return await handler.RemoveFriend(friendshipId);
            });

        }

    }
}
