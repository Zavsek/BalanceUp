using Backend.Data;
using Backend.Handlers;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
namespace Backend.Endpoints
{
    public static class ExpenseEndpoints
    {
        public static void MapExpenseEndpoints(this WebApplication app)
        {
            var ExpenseGroup = app.MapGroup("/api/expenses")
                .RequireAuthorization()
                .RequireRateLimiting("user_limit");
            //Get all expenses
            ExpenseGroup.MapGet("/", async (Guid id,  ExpenseHandler handler) => { return await handler.GetExpenses(id); });
            //Add new expense
            // Odstrani 'ClaimsPrincipal user', ker ga ne rabiš več tukaj
            ExpenseGroup.MapPost("/", async (ExpenseDto expense, ExpenseHandler handler) =>
            {
                return await handler.CreateExpense(expense);
            }); 
            //Delete expense by id
            ExpenseGroup.MapDelete("/{id}", async (Guid id,  ExpenseHandler handler) => { return await handler.DeleteExpense(id); });
            //Update expense by id
            ExpenseGroup.MapPut("/api/expenses/{id}", async (Guid id, Expense expense,  ExpenseHandler handler) => { return await handler.UpdateExpense(id, expense); });

        }
    }
}
