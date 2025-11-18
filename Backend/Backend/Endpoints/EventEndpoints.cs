

using Backend.Controllers;

namespace Backend.Endpoints
{
    public static class EventEndpoints
    {
        public static void MapEventEndpoints(this WebApplication app)
        {
            //PUT update event
            app.MapPut("/api/events/{id}", EventController.UpdateEvent);
            //POST add expense to event
            app.MapPost("/api/events/{eventId}/expenses",   ExpenseController.CreateExpenseForEvent);
            //PUT update shares of expense
            app.MapPut("/api/events/{eventId}/expenses/{expenseId}/shares", ExpenseController.UpdateShares);
            //POST create new event
            app.MapPost("/api/events", EventController.CreateEvent);
            //GET get all expenses in event
            app.MapGet("/api/events/{eventId}/expenses", EventController.GetExpensesForEvent);
            //DELETE delete expense in event
            app.MapDelete("/api/events/{eventId}/expenses/{expenseId}", EventController.DeleteExpenseFromEvent);

        }
    }
}
