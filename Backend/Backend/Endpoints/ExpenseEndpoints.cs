using Backend.Controllers;
namespace Backend.Endpoints
{
    public static class ExpenseEndpoints
    {
        public static void MapExpenseEndpoints(this WebApplication app)
        {
            //Get all expenses
            app.MapGet("/api/expenses", ExpenseController.GetExpenses);
            //Add new expense
            app.MapPost("/api/expenses", ExpenseController.CreateExpense);
            //Delete expense by id
            app.MapDelete("/api/expenses/{id}", ExpenseController.DeleteExpense);
            //Update expense by id
            app.MapPut("/api/expenses/{id}", ExpenseController.UpdateExpense); 

        }
    }
}
