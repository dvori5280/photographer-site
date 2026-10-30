import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Photo } from "../types";

export function usePhotos(categoryId?:string) {
    
    const params = new URLSearchParams();
    categoryId && params.set("categoryId",categoryId);

    const url = "/api/photos?" + params.toString();

    return useQuery(
        {
            placeholderData: keepPreviousData,
            queryKey: ["photos", categoryId],
            queryFn: () => api<Photo[]>(url),
        }
    )
}