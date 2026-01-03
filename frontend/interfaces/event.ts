import EventExpense from "./Dtos/EventExpense";

interface EventObject {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  expenses:EventExpense[];
  users:EventUser[];
}


export interface EventUser{
  userId:string;
  username:string;
}
export default EventObject;
