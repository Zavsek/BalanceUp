using Backend.Data;
using Backend.Handlers;
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
            var EventGroup = app.MapGroup("/api/events")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");
            //PUT update event
            EventGroup.MapPut("/{id}",  async (ExpenseDto expense,  ExpenseHandler handler) => { return await handler.UpdateExpense(expense); });
            //POST add expense to event
            EventGroup.MapPost("/{eventId}/expenses", async ( Guid eventId, EventExpensesDto payload,  ExpenseHandler handler) => { return await handler.CreateExpenseForEvent(eventId, payload); });
            //PUT update shares of expense
            EventGroup.MapPut("/{eventId}/expenses/{expenseId}/shares",async (Guid eventId, Guid expenseId, UpdateSharesDto payload,  ExpenseHandler handler) => { return await handler.UpdateShares(eventId, expenseId, payload); });
            //POST create new event
            EventGroup.MapPost("/",async (CreateEventDto Event, Handlers.EventHandler handler) => { return await handler.CreateEvent(Event); });
            //GET get event info
            EventGroup.MapGet("/{eventId}", async (Guid eventId, Handlers.EventHandler handler) => { return await handler.GetEventInfo(eventId); });
                
            //DELETE delete expense in event
            EventGroup.MapDelete("/{eventId}/expenses/{expenseId}", async (Guid eventId, Guid expenseId, Handlers.EventHandler handler) => { return await handler.DeleteExpenseFromEvent(eventId, expenseId); });

        }
    }
}
