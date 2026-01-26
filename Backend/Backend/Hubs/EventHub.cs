using Backend.Data;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace Backend.Hubs
{
    public class EventHub : Hub
    {
        private readonly AppDbContext _context;

        public EventHub(AppDbContext context) => _context = context;
        public async Task JoinEvent(string eventId)
        {
            var firebaseUid = Context.User?.Claims.FirstOrDefault(c => c.Type == "user_id")?.Value;

            if (!string.IsNullOrEmpty(firebaseUid))
            {
                var internalId = await _context.Users
                    .Where(u => u.firebaseUid == firebaseUid)
                    .Select(u => u.id)
                    .FirstOrDefaultAsync();
                Console.WriteLine($"User {internalId} se pridružuje dogodku {eventId}");
            }
            await Groups.AddToGroupAsync(Context.ConnectionId, eventId);
            Console.WriteLine($"User {Context.ConnectionId} joined Group: {eventId}");
        }
    }
}
