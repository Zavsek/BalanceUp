import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { CreateExpense, expense } from "@/interfaces";

interface ExpenseState{
    expense:expense|null;
    isCreating: boolean;
    createExpense:(expense:CreateExpense) => Promise<boolean>
}

export const useExpenseStore = create<ExpenseState>((set)=>({
    expense:null,
    isCreating: false,
    createExpense:async(expense)=>{
        set({ isCreating: true });
       try{ 
        const res =await  axiosInstance.post<expense>("/api/expenses/", expense);
        return true;
    }
    catch(error){
        console.log("error in Expense store "+ error);
        return false;
    }
    finally {
            set({ isCreating: false });
        }
    }
}));