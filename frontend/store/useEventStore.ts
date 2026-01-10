import { create} from "zustand";
import axiosInstance from "@/lib/axios";
import { CreateEvent, EventDto, EventExpense, EventObject } from "@/interfaces";


interface EventState{
events:EventDto[]|null;
currentEvent:EventObject|null;
fetchingEvents:boolean;
creatingEvent:boolean;
eventExpenses:EventExpense[];
addedUsers:string[];//list of ids
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
}

export const useEventStore = create<EventState>((set, get)=>({
events:null,
fetchingEvents:false,
creatingEvent:false,
currentEvent:null,
eventExpenses:[],
addedUsers:[],
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
    try {
        const res = await axiosInstance.get<EventObject>(`/api/events/${eventId}`);
        set({currentEvent:res.data});
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
            let updatedCurrentEvent = state.currentEvent;
            if (state.currentEvent) {
                updatedCurrentEvent = {
                    ...state.currentEvent,
                    expenses: [createdExpense, ...(state.currentEvent.expenses || [])]
                };
            }
            return {
                eventExpenses: updatedExpenses,
                currentEvent: updatedCurrentEvent
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


            let updatedCurrentEvent = state.currentEvent;
            if (state.currentEvent) {
                const newEventExpenses = (state.currentEvent.expenses || []).map(e => 
                    e.id === expenseId ? updatedExpense : e
                );

                updatedCurrentEvent = {
                    ...state.currentEvent,
                    expenses: newEventExpenses
                };
            }

            return {
                eventExpenses: updatedExpenses,
                currentEvent: updatedCurrentEvent
            };
        });

        return true;
    } catch (error) {
        console.error('An error occurred while updating the expense: ' + error);
        return false;
    }
},
getExpensesForEvent:async(eventId)=>{
        try {
            const res  =await  axiosInstance.get<EventExpense[]>(`/api/expenses/${eventId}`);
            set({eventExpenses: res.data});
        } catch (error) {
            console.error('An error occured while fetching event expenses -->'+error);
        }
},
deleteEventExpense:async(id)=>{
        try {
            await axiosInstance.delete(`/api/expenses/${id}`);
            set((state) => ({
                eventExpenses:
                state.eventExpenses?.filter((e)=> e.id !== id) || []
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
}
}))