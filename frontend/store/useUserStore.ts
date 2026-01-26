import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Dashboard, SpendingGoal, SpendingsCalendar } from "@/interfaces";

interface UserState{
    dashboard: Dashboard | null;
    gettingDashboard:boolean
    numOfPendingFriendRequests:number| null;
    currentCalendar: SpendingsCalendar|null;
    getDashboard: () => Promise<void>;
    getSpendingsCalendar:(year: number, month:number) => Promise<void>; 
    updateGoal:(goalsData: { dailyLimit: number, weeklyLimit: number, monthlyLimit: number }) => Promise<boolean>
}


export const useUserStore = create<UserState>((set)=>({
    dashboard:null,
    gettingDashboard:false,
    currentCalendar: null,
    numOfPendingFriendRequests:null,
    getDashboard: async() =>{
        set({gettingDashboard:true})
        try {
            const res = await axiosInstance.get<Dashboard>("/api/users/dashboard");
            const dashboard:Dashboard = res.data;
            set({dashboard:dashboard})
        } catch (error) {
             console.error("error in loading  dashboard:", error);
        }
        finally{
            set({gettingDashboard:false});
        }
    },
    getSpendingsCalendar: async (year, month)=>{
        try{
            const res = await axiosInstance.get<SpendingsCalendar>(`/api/users/stats/calendar/${year}/${month}`);
            set({currentCalendar: res.data})
        }
        catch(error){
            console.error(error);
        }
    },
    updateGoal: async(goalsData)=>{
        try{
            const res = await axiosInstance.put<SpendingGoal>("/api/goals/", goalsData)
            if (res.status === 200) {
            await useUserStore.getState().getDashboard();
            return true;
        }
        return false;
        }
        catch(error){
            console.error("an error occured while updating goal:", error);
        return false;
        }
    }
}));