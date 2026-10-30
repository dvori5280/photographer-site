import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Photo } from "../types";



export function useAdminPhotos(categoryId?: string, isPublished?: boolean){

    const params = new URLSearchParams();
    if(isPublished !== undefined) 
        params.set("isPublished", String(isPublished));
    if(categoryId) 
        params.set("categoryId", categoryId);
    const url = "/api/admin/photos?" + params.toString();

    return useQuery({
        queryKey: ["adminPhotos", categoryId, isPublished],
        queryFn: () => api<Photo[]>(url)
    })
}