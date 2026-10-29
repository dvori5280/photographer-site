import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Booking, BookingStatus } from "../types";

export type BookingStatusInput = {
  id: string;
  status: BookingStatus;
};

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BookingStatusInput) =>
      api<Booking>("/api/admin/bookings/" + data.id + "/status", {
        method: "PATCH",
        body: JSON.stringify({ status: data.status }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] }),
  });
}