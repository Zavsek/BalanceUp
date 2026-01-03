
import RecentExpese from "./Dtos/recentExpense";
import SpendingGoal from "./SpendingGoal";
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