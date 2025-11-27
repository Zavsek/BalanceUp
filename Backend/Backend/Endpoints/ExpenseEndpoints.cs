using Backend.Controllers;
using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace Backend.Endpoints
{
    public static class ExpenseEndpoints
    {
        public static void MapExpenseEndpoints(this WebApplication app)
        {
            //Get all expenses
            app.MapGet("/api/expenses",async ( Guid id,[FromServices] ExpenseController controller) => { return await controller.GetExpenses(id); });
            //Add new expense
            app.MapPost("/api/expenses", async ( Guid userId, ExpenseDto expense, [FromServices] ExpenseController controller) => { return await controller.CreateExpense(expense, userId); });
            //Delete expense by id
            app.MapDelete("/api/expenses/{id}", async ( Guid id, [FromServices] ExpenseController controller) => { return await controller.DeleteExpense(id); });
            //Update expense by id
            app.MapPut("/api/expenses/{id}", async ( Guid id, Expense expense, [FromServices] ExpenseController controller) => { return await controller.UpdateExpense(id, expense); });

        }
    }
}
