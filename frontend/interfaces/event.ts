import EventExpense from "./Dtos/EventExpense";

interface EventObject {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO date string
  users:EventUser[];
}


export interface EventUser{
  id:string;
  username:string;
}
export default EventObject;
