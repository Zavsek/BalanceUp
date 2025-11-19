using Backend.Controllers;
namespace Backend.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this WebApplication app)
        {
            //PUT update user
            app.MapPut("/api/users/{id}", UserController.UpdateUser);
            //GET user by id
            app.MapGet("/api/users/{id}", UserController.GetUserById);
            //GET user by username
            app.MapGet("/api/users/id/{username}", UserController.GetUserByUsername);
            app.MapDelete("/api/users/{id}", UserController.DeleteUser);

            //------------------------------------------
            // Friend Requests Endpoints
            //PUT send friend request
            app.MapPut("/api/users/friend_requests", UserController.SendFriendRequest);
            //GET friend requests for user
            app.MapGet("/api/users/{id}/friend_requests", UserController.GetFriendRequests);
            //DELETE friend request
            app.MapDelete("/api/users/friend_requests/{requestId}", UserController.DeleteFriendRequest);
            //POST accept friend request
            app.MapPost("/api/users/friend_requests/{requestId}", UserController.AddFriend);

            //--------------------------------------------
            //Friends Endpoints
            //GET friends for user
            app.MapGet("/api/users/{id}/friends", UserController.GetFriends);
            //DELETE remove friend
            app.MapDelete("/api/users/{userId}/friends/{friendId}", UserController.RemoveFriend);

        }

    }
}
