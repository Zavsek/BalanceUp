
import RecentExpese from "./Dtos/recentExpense";
interface Dashboard{
    dailySpent:number;
    dailyLimit:number| null;
    weeklySpent:number;
    weeklyLimit:number|null;
    monthlySpent:number;
    monthlyLimit:number| null;
    recentExpenses: RecentExpese[];
}

export default Dashboard;