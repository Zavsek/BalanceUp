using Backend.Data;
using Microsoft.EntityFrameworkCore;

namespace Backend.Middleware
{
    public class UserMappingMiddleware
    {
        private readonly RequestDelegate _next;

        public UserMappingMiddleware(RequestDelegate _next) => this._next = _next;

        public async Task InvokeAsync(HttpContext context, AppDbContext dbContext)
        {
            if (context.User.Identity?.IsAuthenticated == true)
            {
                var firebaseUid = context.User.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;
                if (!string.IsNullOrEmpty(firebaseUid))
                {
                    var internalId = await dbContext.Users
                        .Where(u => u.firebaseUid == firebaseUid)
                        .Select(u => u.id)
                        .FirstOrDefaultAsync();

                    context.Items["InternalUserId"] = internalId;
                }
            }
            await _next(context);
        }
    }
}
