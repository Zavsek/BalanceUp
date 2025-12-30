using Backend.Data;
using Backend.Models;
using Backend.Models.Dto;
using Microsoft.EntityFrameworkCore;

namespace Backend.Handlers
{
    public  class SpendingGoalsHandler
    {
        private readonly AppDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;
        public SpendingGoalsHandler(AppDbContext context, IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
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
        public  async Task<IResult> UpdateGoal(SpendingGoalDto dto)
        {
            try
            {
                var userId = _httpContextAccessor.HttpContext?.Items["InternalUserId"] as Guid?;
                if (userId == null) return Results.Unauthorized();


                var goals = await _context.SpendingGoals.FirstOrDefaultAsync(g => g.userId == userId);

                if (goals == null)
                {

                    goals = new SpendingGoal
                    {
                        id = Guid.NewGuid(),
                        userId = userId.Value,
                        dailyLimit = dto.dailyLimit,
                        weeklyLimit = dto.weeklyLimit,
                        monthlyLimit = dto.monthlyLimit
                    };
                    _context.SpendingGoals.Add(goals);
                }
                else
                {

                    goals.dailyLimit = dto.dailyLimit;
                    goals.weeklyLimit = dto.weeklyLimit;
                    goals.monthlyLimit = dto.monthlyLimit;
                }

                await _context.SaveChangesAsync();
                return Results.Ok(goals);
            }
            catch (Exception ex)
            {
                return Results.Problem("Error updating goals: " + ex.Message);
            }
        }
    }
}
