export enum ExpenseType {
  Travel = 1,
  Food = 2,
  Drinks = 3,
  Accommodation = 4,
  Miscellaneous = 5,
}

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
