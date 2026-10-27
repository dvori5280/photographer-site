import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";


export type ContactInput = {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
};
export function useSendContact() {

    return useMutation({
        mutationFn: (data : ContactInput)=>api<{ id: string; createdAt: string }>("/api/contact", { method: "POST", body: JSON.stringify(data) }),
    })
    
}