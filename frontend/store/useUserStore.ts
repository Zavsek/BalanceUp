import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Dashboard } from "@/interfaces";

interface UserState{
    dashboard: Dashboard | null;
    gettingDashboard:boolean
    getDashboard: () => Promise<void>
}


export const useUserStore = create<UserState>((set)=>({
    dashboard:null,
    gettingDashboard:false,
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
    }
}))