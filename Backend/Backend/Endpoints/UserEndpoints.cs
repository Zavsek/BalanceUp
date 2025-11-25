using Backend.Controllers;
using Microsoft.AspNetCore.Mvc;
using Backend.Models.Dto;
namespace Backend.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this WebApplication app)
        {
            //PUT update user
            app.MapPut("/api/users/{id}", async([FromBody] Guid id, [FromServices] UserController controller) =>
            {
                return await controller.UpdateUser(id);
            });
            //GET user by id
            app.MapGet("/api/users/{id}", async ([FromBody] Guid id, [FromServices] UserController controller) =>
            {
                return await controller.GetUserById(id);
            });
            //GET user by username
            app.MapGet("/api/users/id/{username}", async ([FromBody] string username, [FromServices] UserController controller) =>
            {
                return await controller.GetUserByUsername(username);
            });
            //DELETE user by id
            app.MapDelete("/api/users/{id}", async ([FromBody] Guid id, [FromServices] UserController controller) => { return await controller.DeleteUser(id); });
            //POST upload profile picture
            app.MapPost("/api/users/{id}/profile_pic", async ([FromBody] Guid id, IFormFile file, [FromServices] UserController controller) =>
            {
                return await controller.UploadProfilePic(id, file);
            });

            //------------------------------------------
            // Friend Requests Endpoints
            //PUT send friend request
            app.MapPut("/api/users/friend_requests", async ([FromBody] FriendRequestDto request, [FromServices] UserController controller) => { return await controller.SendFriendRequest(request); });
            //GET friend requests for user
            app.MapGet("/api/users/{id}/friend_requests", async ([FromBody] Guid id, [FromServices] UserController controller) => { return await controller.GetFriendRequests(id); });
            //DELETE friend request
            app.MapDelete("/api/users/friend_requests/{requestId}", async ([FromBody] Guid id, [FromServices] UserController controller) =>
            {
                return await controller.DeleteFriendRequest(id);
            });
            //POST accept friend request
            app.MapPost("/api/users/friend_requests/{requestId}", async ([FromBody] Guid requestId, [FromServices] UserController controller) => { return await controller.AddFriend(requestId); });

            //--------------------------------------------
            //Friends Endpoints
            //GET friends for user
            app.MapGet("/api/users/{id}/friends", async ([FromBody] Guid id, [FromServices] UserController controller) => { return await controller.GetFriends(id); });
            //DELETE remove friend
            app.MapDelete("/api/users/{userId}/friends/{friendId}", async ([FromBody] Guid userId, Guid friendId, [FromServices] UserController controller) =>
            {
                return await controller.RemoveFriend(userId, friendId);
            });

        }

    }
}
