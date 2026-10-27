import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Booking, EventType } from "../types";

   export type BookingInput = {
     packageId: string;
     requestedDate: string;
     eventType: EventType;
     location: string;
     phone: string;
     notes?: string;
   };


   export function useCreateBooking()
   {
        const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (data : BookingInput)=>api<Booking>("/api/bookings", { method: "POST", body: JSON.stringify(data) }),
            onSuccess: ()=>queryClient.invalidateQueries({ queryKey: ["myBookings"] })
        })
   }

