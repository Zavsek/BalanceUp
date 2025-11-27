using Backend.Data;
using Backend.Models;
using Microsoft.EntityFrameworkCore;

namespace Backend.Controllers
{
    public  class SpendingGoalsController
    {
        private readonly AppDbContext _context;
        public SpendingGoalsController(AppDbContext context)
        {
            _context = context;
        }
        public  async Task<IResult> GetGoal(Guid userId)
        {
            try
            {
                var goal = await _context.SpendingGoals
                    .Where(sg => sg.userId == userId)
                    .SingleOrDefaultAsync();
                return TypedResults.Ok(goal);
            }
            catch (Exception ex)
            {
                return TypedResults.InternalServerError("error in Spending Goals Controller " + ex.Message);
            }
        }
        public  async Task<IResult> UpdateGoal(Guid Id,SpendingGoal spendingGoal)
        {
            try
            {
                if (Id != spendingGoal.id) return TypedResults.BadRequest("Id does not match!");
                var existingGoal = await _context.SpendingGoals.FindAsync(Id);
                if (existingGoal != null) return TypedResults.NotFound("Goal not found");
                existingGoal.weeklyLimit = spendingGoal.weeklyLimit;
                existingGoal.monthlyLimit = spendingGoal.monthlyLimit;
                existingGoal.dailyLimit = spendingGoal.dailyLimit;
                _context.SpendingGoals.Update(existingGoal);
                await _context.SaveChangesAsync();
                return TypedResults.Ok(existingGoal);

            }
            catch (Exception ex) {
                return TypedResults.InternalServerError("Error in Spending Goals Controller " + ex.Message);
            }
        }
    }
}
