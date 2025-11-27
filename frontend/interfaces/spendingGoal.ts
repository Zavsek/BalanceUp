interface spendingGoal {
  id: string;
  userId: string;
  weeklyLimit?: number | null;
  dailyLimit?: number | null;
  monthlyLimit?: number | null;
}

export default spendingGoal;
