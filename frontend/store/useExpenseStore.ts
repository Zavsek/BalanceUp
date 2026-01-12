import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { CreateExpense, EventExpense, Expense, ExpenseDto, ExpenseResponse } from "@/interfaces";
import { useUserStore } from "./useUserStore";

interface ExpenseState{
    expenses:ExpenseDto[]|null;
    fetchingExpenses:boolean
    isCreating: boolean;
    pageNumber:number;
    totalCount:number|null;
    totalPages:number|null;
    createExpense:(expense:CreateExpense) => Promise<boolean>
    getExpenses:()=> Promise<void>;
    deleteExpense:(id:string)=>Promise<boolean>;
    updateExpense:(expense:ExpenseDto)=>Promise<boolean>;
    resetExpenses:()=>void;
}

export const useExpenseStore = create<ExpenseState>((set)=>({
    expenses:null,
    fetchingExpenses:false,
    isCreating: false,
    pageNumber:0,
    pageSize:20,
    totalCount: null,
    totalPages: null,
    eventExpenses:[],
    createExpense:async(expense)=>{
        set({ isCreating: true });
       try{ 
        const res =await  axiosInstance.post<Expense>("/api/expenses/", expense);
        await useUserStore.getState().getDashboard();
        return true;
    }
    catch(error){
        console.log("error in Expense store "+ error);
        return false;
    }
    finally {
            set({ isCreating: false });
        }
    },
    getExpenses:async()=>{
        const { pageNumber, totalPages, fetchingExpenses } = useExpenseStore.getState();
        if (totalPages !== null && pageNumber >= totalPages) return;
        set({fetchingExpenses:true})
        try {
           const nextPage = pageNumber + 1;
        const res = await axiosInstance.get<ExpenseResponse>(`/api/expenses/${nextPage}`);
        
        set((state) => ({
            expenses: state.expenses ? [...state.expenses, ...res.data.data] : res.data.data,
            pageNumber: nextPage,
            totalCount: res.data.totalCount,
            totalPages: res.data.totalPages
        }));
        } catch (error) {
            console.error("Failed to retrieve expenses "+error);
        }
        finally{
            set({fetchingExpenses:false});
        }
    },
    deleteExpense:async(id)=>{
        try {
            await axiosInstance.delete(`/api/expenses/${id}`);
            set((state) => ({
                expenses:
                state.expenses?.filter((e)=> e.id !== id) || []
            }));
            return true;
        } catch (error) {
            console.error("failed to delete expense "+error );
            return false;
        }
    },
    updateExpense:async(expense)=>{
        try {
            const res = await axiosInstance.put(`/api/expenses/${expense.id}`, expense);
            set((state) => ({
            expenses: state.expenses?.map(e => e.id === expense.id ? expense : e) || []
        }));
            return true;
        } catch (error) {
            console.error("error while updating expense "+ error);
            return false;
        }
    },
    resetExpenses: () => {
    set({
        expenses: null,
        pageNumber: 0,
        totalPages: null,
        totalCount: null
    });
},
}));