import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { CreateExpense, EventExpense, Expense, ExpenseDto } from "@/interfaces";
import { useUserStore } from "./useUserStore";

interface ExpenseState{
    expenses:ExpenseDto[]|null;
    fetchingExpenses:boolean
    isCreating: boolean;
    createExpense:(expense:CreateExpense) => Promise<boolean>
    getExpenses:()=> Promise<void>;
    deleteExpense:(id:string)=>Promise<boolean>;
    updateExpense:(expense:ExpenseDto)=>Promise<boolean>;

}

export const useExpenseStore = create<ExpenseState>((set)=>({
    expenses:null,
    fetchingExpenses:false,
    isCreating: false,
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
        set({fetchingExpenses:true})
        try {
            const res = await axiosInstance.get<ExpenseDto[]>("/api/expenses/");
            set({expenses:res.data});
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
    }
}));