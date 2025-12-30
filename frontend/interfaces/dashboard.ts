
import RecentExpese from "./Dtos/recentExpense";
import spendingGoal from "./spendingGoal";
interface Dashboard{
    dailySpent:number;
    weeklySpent:number;
    monthlySpent:number;
    dailyLimit:number | null;
    weeklyLimit: number|null;
    monthlyLimit:number|null;
    recentExpenses: RecentExpese[];
}

export default Dashboard;