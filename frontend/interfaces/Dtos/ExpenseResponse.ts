import ExpenseDto from "./ExpenseDto";

interface ExpenseResponse{
    totalCount:number;
    page: number;
    totalPages:number;
    data:ExpenseDto[];
}
export default ExpenseResponse;