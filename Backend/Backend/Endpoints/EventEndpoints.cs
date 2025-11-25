using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Backend.Endpoints
{
    public static class EventEndpoints
    {
        public static void MapEventEndpoints(this WebApplication app)
        {
            //PUT update event
            app.MapPut("/api/events/{id}",  async ( Guid id, Expense expense, [FromServices] ExpenseController controller) => { return await controller.UpdateExpense(id, expense); });
            //POST add expense to event
            app.MapPost("/api/events/{eventId}/expenses", async ( Guid eventId, EventExpenseDto payload, [FromServices] ExpenseController controller) => { return await controller.CreateExpenseForEvent(eventId, payload); });
            //PUT update shares of expense
            app.MapPut("/api/events/{eventId}/expenses/{expenseId}/shares",async (Guid eventId, Guid expenseId, UpdateSharesDto payload, [FromServices] ExpenseController controller) => { return await controller.UpdateShares(eventId, expenseId, payload); });
            //POST create new event
            app.MapPost("/api/events",async ( CreateEventDto Event, [FromServices] EventController controller) => { return await controller.CreateEvent(Event); });
            //GET get all expenses in event
            app.MapGet("/api/events/{eventId}/expenses", async ( Guid eventId, [FromServices] EventController controller) => { return await controller.GetExpensesForEvent(eventId); });

            //DELETE delete expense in event
            app.MapDelete("/api/events/{eventId}/expenses/{expenseId}", async (Guid eventId, Guid expenseId, [FromServices] EventController controller) => { return await controller.DeleteExpenseFromEvent(eventId,expenseId); });

        }
    }
}
