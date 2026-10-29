import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type {  ContactMessage, ContactStatus } from "../types";

export function useAdminMessages(status?: ContactStatus) {

    const params = new URLSearchParams();
    if (status) {
        params.append("status", status);
    }

    return useQuery({
  queryKey: ["adminMessages", status],
  queryFn: () => api<ContactMessage[]>("/api/admin/messages?" + params.toString()),
});
}