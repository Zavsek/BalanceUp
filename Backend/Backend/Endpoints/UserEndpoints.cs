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
            UserGroup.MapGet("/me", async (UserHandler controller, ClaimsPrincipal user) =>
            {
                return await controller.GetPersonalDetails(user);
            });

            //DELETE delete sender via JWT
            UserGroup.MapDelete("/me", async(UserHandler controller, ClaimsPrincipal user) => {  return await controller.DeletePersonalUser(user); });
            //PUT update user
            UserGroup.MapPut("/{id}", async(Guid id,  UserHandler controller) =>
            {
                return await controller.UpdateUser(id);
            });
            //GET user by id
            UserGroup.MapGet("/find-by-id/{id}", async ( Guid id,  UserHandler controller) =>
            {
                return await controller.GetUserById(id);
            });
            //GET user by username
            UserGroup.MapGet("/find-by-username/{username}", async ( string username,  UserHandler controller) =>
            {
                return await controller.GetUserByUsername(username);
            });
            //POST upload profile picture
            UserGroup.MapPost("/{id}/profile_pic", async ( Guid id, IFormFile file,  UserHandler controller) =>
            {
                return await controller.UploadProfilePic(id, file);
            });

            //------------------------------------------
            // Friend Requests Endpoints
            //PUT send friend request
            UserGroup.MapPut("/friend_requests", async ( FriendRequestDto request,  UserHandler controller) => { return await controller.SendFriendRequest(request); });
            //GET friend requests for user
            UserGroup.MapGet("/{id}/friend_requests", async ( Guid id,  UserHandler controller) => { return await controller.GetFriendRequests(id); });
            //DELETE friend request
            UserGroup.MapDelete("/friend_requests/{requestId}", async ( Guid id,  UserHandler controller) =>
            {
                return await controller.DeleteFriendRequest(id);
            });
            //POST accept friend request
            UserGroup.MapPost("/friend_requests/{requestId}", async ( Guid requestId,  UserHandler controller) => { return await controller.AddFriend(requestId); });

            //--------------------------------------------
            //Friends Endpoints
            //GET friends for user
            UserGroup.MapGet("/{id}/friends", async (Guid id,  UserHandler controller) => { return await controller.GetFriends(id); });
            //DELETE remove friend
            UserGroup.MapDelete("/{userId}/friends/{friendId}", async ( Guid userId, Guid friendId,  UserHandler controller) =>
            {
                return await controller.RemoveFriend(userId, friendId);
            });

        }

    }
}
