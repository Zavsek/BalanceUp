interface spendingGoal {
  id: number;
  userId: number;
  weeklyLimit?: number | null;
  dailyLimit?: number | null;
  monthlyLimit?: number | null;
}

export default spendingGoal;
