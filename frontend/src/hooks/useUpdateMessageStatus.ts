import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { ContactMessage, ContactStatus  } from "../types";

export type MessageStatusInput = {
  id: string;
  status: ContactStatus;
};

export function useUpdateMessageStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MessageStatusInput) =>
      api<ContactMessage>("/api/admin/messages/" + data.id + "/status", {
        method: "PATCH",
        body: JSON.stringify({ status: data.status }),
      }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["adminMessages"] }),
  });
}