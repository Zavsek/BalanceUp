import { create } from "zustand";
import axiosInstance from "@/lib/axios";
import { FriendshipCard, IncomingFriendRequest, UserCard } from "@/interfaces";

interface friendshipState {
  numOfPendingFriendRequests: number;
  pendingFriendRequests: IncomingFriendRequest[] | null;
  friends: FriendshipCard[]|null;
  fetchingUsers:boolean;
  getPendingFriendRequests: () => Promise<void>;
  getNumberOfPendingFriendRequests: () => Promise<void>;
  findUsersById: (id: string) => Promise<UserCard | null | undefined>;
  findUsersByUsername: (
    username: string
  ) => Promise<UserCard[] | null | undefined>;
  sendFriendRequest: (toUserId: string) => Promise<boolean>;
  acceptFriendRequest: (requestId: string) => Promise<boolean>;
  rejectFriendRequest: (requestId: string) => Promise<boolean>;
  showFriendsList:()=>Promise<void>;
  deleteFriend:(friendshipId:string)=>Promise<boolean>;
}

export const useFriendStore = create<friendshipState>((set) => ({
  numOfPendingFriendRequests: 0,
  pendingFriendRequests: null,
  fetchingUsers:false,
  friends:null,
  getNumberOfPendingFriendRequests: async () => {
    try {
      const response = await axiosInstance.get<{ count: number }>(
        "/api/users/friend-requests/count"
      );
      set({ numOfPendingFriendRequests: response.data.count });
    } catch (error) {
      console.error(
        "error while getting number of pending friend requests " + error
      );
    }
  },
  getPendingFriendRequests: async () => {
    try {
      const response = await axiosInstance.get<IncomingFriendRequest[]>(
        "/api/users/friend-requests"
      );
      set({ pendingFriendRequests: response.data });
    } catch (error) {
      console.error("error while getting pending friend requests", error);
    }
  },
  findUsersById: async (id) => {
    if (!id) {
      console.error("there was no id present  in the query");
      return;
    }
    try {
      const response = await axiosInstance.get<UserCard>(
        `/api/users/find-by-id/${id}`
      );
      return response.data;
    } catch (error) {
      console.error("An error occured while fetching users by id " + error);
    }
  },
  findUsersByUsername: async (username) => {
    if (!username) {
      console.error("there was no username present  in the query");
      return;
    }
    try {
      const response = await axiosInstance.get<UserCard[]>(
        `/api/users/find-by-username/${username}`
      );
      return response.data;
    } catch (error) {
      console.error("An error occured while fetching users by id " + error);
    }
  },
  sendFriendRequest: async (toUserId) => {
    try {
      await axiosInstance.post<string>(
        `/api/users/friend-requests/${toUserId}`
      );
      return true;
    } catch (error) {
      console.error("failed to send friend request " + error);
      return false;
    }
  },
  acceptFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/api/users/friend-requests/add/${requestId}`);

      set((state) => ({
        pendingFriendRequests:
          state.pendingFriendRequests?.filter(
            (r) => r.requestId !== requestId
          ) || [],
        numOfPendingFriendRequests: Math.max(
          0,
          state.numOfPendingFriendRequests - 1
        ),
      }));
      return true;
    } catch (error) {
      console.error("failed to send friend request " + error);
      return false;
    }
  },
  rejectFriendRequest: async (requestId) => {
    try {
      await axiosInstance.post(
        `/api/users/friend-requests/reject/${requestId}`
      );
      set((state) => ({
        pendingFriendRequests:
          state.pendingFriendRequests?.filter(
            (r) => r.requestId !== requestId
          ) || [],
        numOfPendingFriendRequests: Math.max(
          0,
          state.numOfPendingFriendRequests - 1
        ),
      }));
      return true;
    } catch (error) {
      console.error("failed to send friend request " + error);
      return false;
    }
  },
  showFriendsList:async()=>{
    set({fetchingUsers:true});
    try {
        const response = await axiosInstance.get<FriendshipCard[]>("/api/users/friends");
        set({friends:response.data});
    } catch (error) {
        console.error("failed to fetch friends");    
    }
    finally{
        set({fetchingUsers:false});
    }
  },
  deleteFriend: async(friendshipId)=>{
    try {
        await axiosInstance.delete(`/api/users/friends/${friendshipId}`);
          set((state) => ({
        friends:
          state.friends?.filter(
            (r) => r.friendshipId !== friendshipId
          ) || []
      }));

        return true;
    } catch (error) {
        console.error("An error occured while deleting friends"+ error);
        return false;
    }    
  }
}));
