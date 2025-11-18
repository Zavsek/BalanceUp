using Backend.Controllers;
namespace Backend.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this WebApplication app)
        {
            app.MapPut("/api/users/{id}", UserController.UpdateUser);
        }

    }
}
