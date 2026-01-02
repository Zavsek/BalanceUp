import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Dashboard, spendingGoal } from "@/interfaces";

interface UserState{
    dashboard: Dashboard | null;
    gettingDashboard:boolean
    numOfPendingFriendRequests:number| null;
    getPendingFriendRequests:()=>Promise<void>;
    getDashboard: () => Promise<void>
    updateGoal:(goalsData: { dailyLimit: number, weeklyLimit: number, monthlyLimit: number }) => Promise<boolean>
}


export const useUserStore = create<UserState>((set)=>({
    dashboard:null,
    gettingDashboard:false,
    numOfPendingFriendRequests:null,
    getDashboard: async() =>{
        set({gettingDashboard:true})
        try {
            const res = await axiosInstance.get<Dashboard>("/api/users/dashboard");
            const dashboard:Dashboard = res.data;
            set({dashboard:dashboard})
        } catch (error) {
             console.error("Napaka pri pridobivanju dashboarda:", error);
        }
        finally{
            set({gettingDashboard:false});
        }
    },
    updateGoal: async(goalsData)=>{
        try{
            const res = await axiosInstance.put<spendingGoal>("/api/goals/", goalsData)
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
    },
    getPendingFriendRequests:async()=>{
        try{
            const
        }
    }
}))