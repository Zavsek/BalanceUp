import ExpenseType from "../types/ExpenseType";

interface CreateExpense{
    amount:number;
    type:ExpenseType;
    description:string;
    time:string;
}
export default CreateExpense;