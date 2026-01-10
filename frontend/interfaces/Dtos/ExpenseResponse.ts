import ExpenseDto from "./ExpenseDto";

interface ExpenseResponse{
    totalCount:number;
    page: number;
    pageSize:number;
    totalPages:number;
    data:ExpenseDto[];
}
export default ExpenseResponse;