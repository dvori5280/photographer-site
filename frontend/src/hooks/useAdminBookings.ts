import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Booking } from "../types";

export function useAdminBookings(status?: string,eventType?: string) {

    const params = new URLSearchParams();
    if (status) {
        params.append("status", status);
    }
    if (eventType) {
        params.append("eventType", eventType);
    }

    return useQuery({
  queryKey: ["adminBookings", status, eventType],
  queryFn: () => api<Booking[]>("/api/admin/bookings?" + params.toString()),
});
}