import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { Dashboard, SpendingGoal, SpendingsCalendar } from "@/interfaces";
import { useAuthStore } from "./useAuthStore";

interface UserState{
    dashboard: Dashboard | null;
    gettingDashboard:boolean
    numOfPendingFriendRequests:number| null;
    currentCalendar: SpendingsCalendar|null;
    getDashboard: () => Promise<void>;
    getSpendingsCalendar:(year: number, month:number) => Promise<void>; 
    updateGoal:(goalsData: { dailyLimit: number, weeklyLimit: number, monthlyLimit: number }) => Promise<boolean>;
    uploadProfilePicture:(imageUri: string) => Promise<string|null>
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
    },
    uploadProfilePicture: async (imageUri: string) => {
  try {
    const userInstance = useAuthStore.getState().userInstance;
    
    if (!userInstance || !userInstance.id) {
      console.error("User instance not found.");
      return null;
    }

    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];
    const fileName = `${userInstance.id}-${Date.now()}.${fileType}`;

    // @ts-ignore
    formData.append('file', {
      uri: imageUri,
      name: fileName,
      type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
    });

    const res = await axiosInstance.post(
      `/api/users/${userInstance.id}/profile_pic`, 
      formData, 
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );

    if (res.status === 200) {
      const newUrl = res.data.profilePictureUrl;

      useAuthStore.setState({
        userInstance: { ...userInstance, profilePictureUrl: newUrl }
      });

      return newUrl;
    }
    return null;
  } catch (error) {
    console.error("an error occured while uploading:", error);
    return null;
  }
},
}));