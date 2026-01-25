import { create} from "zustand";
import axiosInstance from "@/lib/axios";
import { CreateEvent, EventDto, EventExpense, EventExpenseResponse, EventObject } from "@/interfaces";
import * as signalR from "@microsoft/signalr";
import {API_URL} from "../constants/ApiConfig";
import { useAuthStore } from "./useAuthStore";

interface EventState{
events:EventDto[]|null;
currentEvent:EventObject|null;
fetchingEvents:boolean;
creatingEvent:boolean;
eventExpenses:EventExpense[];
addedUsers:string[];//list of ids
fetchingEventExpenses: boolean;
pageSize:number;
noMoreExpenses: boolean;
pageNumber:number;
totalCount:number|null;
totalPages:number|null;
getEvents:()=>Promise<void>;
createEvent:(title:string, description:string|null)=>Promise<boolean>;
getEventInfo:(eventId:string)=>Promise<void>;
addUserToList:(id:string)=>void;
removeUserFromList: (id: string) => void; 
clearCurrentEvent: () => void; 
addEventExpense:(eventId:string, expense:EventExpense) => Promise<boolean>;
updateEventExpense:(eventId:string, expenseId:string, expense:EventExpense)=>Promise<boolean>
getExpensesForEvent:(eventId:string)=>Promise<void>;
deleteEventExpense:(expenseId:string)=>Promise<Boolean>;
addUsersToEvent:(eventId:string, inviteeIds:string[])=>Promise<boolean>;


resetExpenses: () => void;
//signalR
connection: signalR.HubConnection |null;
setupSignalR: (eventId:string) =>Promise<void>;
stopSignalR: ()=> void;
}

export const useEventStore = create<EventState>((set, get)=>({
events:null,
fetchingEvents:false,
creatingEvent:false,
currentEvent:null,
eventExpenses:[],
addedUsers:[],
fetchingEventExpenses: true,

noMoreExpenses:false,
pageNumber: 0,
pageSize:20,
totalCount: null,
totalPages: null,
connection: null,
getEvents:async()=>{
    set({fetchingEvents:true});
    try {
        const res = await axiosInstance.get<EventDto[]>("/api/user-events/")
        set({events:res.data});
    } catch (error) {
        console.error("An error occured while fetching events for user " + error);
    }
    finally{
        set({fetchingEvents:false});
    }
},
createEvent:async(title, description)=>{
    set({creatingEvent:true})
    const newEvent:CreateEvent = {
        title:title,
        description:description,
        users: get().addedUsers
    }
    try{
        const res = await axiosInstance.post<EventDto>("/api/events/", newEvent);
        const createdEvent = res.data;
        set((state) => ({
        events: state.events ? [createdEvent, ...state.events] : [createdEvent],
        addedUsers: [] 
      }));
        return true;
    }
    catch(error){
        console.error("An error occured while creating an event "+error);
        return false;
    }
    finally{
        set({creatingEvent:false});
    }
},
getEventInfo:async(eventId)=>{
    set({ currentEvent: null });
    get().resetExpenses();
    try {
        const res = await axiosInstance.get<EventObject>(`/api/events/${eventId}`);
        set({currentEvent:res.data});
        await useEventStore.getState().getExpensesForEvent(res.data.id);
    } catch (error) {
        console.error(`An Error occured while loading event ${eventId} ==> ${error}`  );
    }
},
addUserToList:(id)=>{
    set((state) => ({ addedUsers: [...state.addedUsers, id] }));
},
removeUserFromList: (id) => {
    set((state) => ({ addedUsers: state.addedUsers.filter(uid => uid !== id) }));
  },
  
  clearCurrentEvent: () => set({ currentEvent: null }),
  addEventExpense:async(eventId, expense)=>{
        try {
            const res  = await axiosInstance.post<EventExpense>(`/api/events/${eventId}/expenses`, expense)
            const createdExpense:EventExpense = res.data;
            set((state) => {
            const updatedExpenses = [createdExpense, ...(state.eventExpenses || [])];
             const totalCount =  state.totalCount ? state.totalCount+1 : 1 
            return {
                eventExpenses: updatedExpenses,
                totalCount: totalCount
            };
        });

        return true;
    } catch (error) {
        console.error('An error occured while adding an expense: ' + error);
        return false;
    }
},
updateEventExpense: async (eventId, expenseId, expense) => {
    try {
        const res = await axiosInstance.put<EventExpense>(
            `/api/events/${eventId}/expenses/${expenseId}`, 
            expense
        );
        
        const updatedExpense: EventExpense = res.data;

        set((state) => {

            const updatedExpenses = (state.eventExpenses || []).map(e => 
                e.id === expenseId ? updatedExpense : e
            );
            return {
                eventExpenses: updatedExpenses,
            };
        });

        return true;
    } catch (error) {
        console.error('An error occurred while updating the expense: ' + error);
        return false;
    }
},
getExpensesForEvent:async(eventId)=>{
    const { totalPages, noMoreExpenses , pageNumber, eventExpenses, fetchingEventExpenses} = useEventStore.getState(); 
    if (fetchingEventExpenses || noMoreExpenses) return;
        set({fetchingEventExpenses: true})
        const lastId = eventExpenses.length >0
            ? eventExpenses[eventExpenses.length -1 ].id
            : null;
        try {
            const nextPage = pageNumber +1;
            const res  =await  axiosInstance.get<EventExpenseResponse>(`/api/expenses/events/${eventId}${lastId ?  `?lastId=${lastId}` : ""}`);


            set((state)=>({
                eventExpenses: res.data?.data 
                    ? [...(state.eventExpenses || []), ...res.data.data] 
                    : (state.eventExpenses || []),
                pageNumber: nextPage,
                totalCount: res.data.totalCount ?? state.totalCount,
                totalPages: res.data.totalPages ?? state.totalPages,
                noMoreExpenses: res.data.data.length < 20
            }));

        } catch (error) {
            console.error('An error occured while fetching event expenses -->'+error);
        }
        finally{
                    set({fetchingEventExpenses: false})
        }
},
deleteEventExpense:async(id)=>{
        try {
            await axiosInstance.delete(`/api/expenses/${id}`);
            set((state) => ({
                eventExpenses:
                state.eventExpenses?.filter((e)=> e.id !== id) || [],
                totalCount: state.totalCount ? state.totalCount -1 : 0
            }));
            return true;
        } catch (error) {
            console.error("failed to delete expense "+error );
            return false;
        }
    },
addUsersToEvent:async(eventId, inviteeIds)=>{
    try{
        await axiosInstance.put(`/api/events/${eventId}/users`, inviteeIds);
        await useEventStore.getState().getEventInfo(eventId);
        return true;
    }
    catch(error){
        console.error("An error occured while adding users to event "+error);
        return false;
    }
},

resetExpenses: () => {
    set({
        eventExpenses: [],
        totalCount: null,
        totalPages: null,
        noMoreExpenses:false,
        fetchingEventExpenses: false
    });
},
setupSignalR: async(eventId)=>{
    if(get().connection) return;
    const newConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/eventHub`, {
        accessTokenFactory: () => useAuthStore.getState().token ?? ""})
    .withAutomaticReconnect()
    .build()

    try {
        await newConnection.start();
        console.log("SignalR Connected!");

        await  newConnection.invoke("JoinEvent", eventId);
        
        //recieve expenses
        newConnection.on("ReceiveNewExpense", (newExpense)=>{
           set((state) => {
        const exists = state.eventExpenses?.some(e => e.id === newExpense.id);
        if (exists) return state;
        return {
            eventExpenses: [newExpense, ...(state.eventExpenses || [])],
            totalCount: (state.totalCount || 0) + 1
        };
    });
        });

        // update Expenses
        newConnection.on("ReceiveUpdateExpense", (updatedExpense)=>{
            set((state)=>({
                eventExpenses : state.eventExpenses?.map(e => e.id == updatedExpense.id ? updatedExpense : e)|| []
            }));
        });

        //delete Expense
        newConnection.on("ReceiveDeleteExpense", (deletedId)=>{
            set((state) => {
            const exists = state.eventExpenses?.some(e => e.id === deletedId);
            if (!exists) return state; 

            return {
                eventExpenses: state.eventExpenses.filter(e => e.id !== deletedId),
                totalCount: state.totalCount ? state.totalCount - 1 : 0
        };
    });
        });

        set({connection:newConnection});
    } catch (error) {
        console.error("SignalR connection error " + error);
        
    }
},
stopSignalR: async ()=>{
    const conn = get().connection;
    if (conn) {
      await conn.stop();
      set({ connection: null });
      console.log("SignalR Disconnected");
}
}}))