import ExpenseType from "../types/ExpenseType";
import UserExpenseShare from "../UserExpenseShare";

interface EventExpense{
    id:string|null;
    amount:number;
    description:string;
    type:ExpenseType;
    dateTime:string
    shares:UserExpenseShare[]
}
export default EventExpense;