import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Booking } from "../types";



export function useMyBookings() {

    return useQuery({
        queryKey: ["myBookings"],
        queryFn: ()=>api<Booking[]>("/api/bookings/my"),
    })
}