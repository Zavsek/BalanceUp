import ExpenseType from "./types/ExpenseType";


interface expense {
  id: string;
  amount: number;
  type: ExpenseType;
  description: string;
  dateTime: string; // ISO date string
  userId?: string | null;
  eventId?: string | null;
}

export default expense;
