import EventExpense from "./EventExpense";


interface EventExpenseResponse{
    totalCount:number;
    totalPages:number;
    data:EventExpense[];
}
export default EventExpenseResponse;