import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Photo } from "../types";
import { api } from "../api/client";



export type PhotoInput = {
    title: string,
    imageUrl: string,
    categoryId: string,
    description?: string | null,
    takenAt?: string | null,
    isPublished?: boolean,
}

export function useCreatePhoto() {

    const queryClient = useQueryClient();
        return useMutation({
            mutationFn: (data: PhotoInput) => api<Photo>("/api/photos", { method: "POST", body: JSON.stringify(data) }),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: ["adminPhotos"] })
                queryClient.invalidateQueries({ queryKey: ["photos"] })
            }
        })
}

export function useUpdatePhoto() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PhotoInput & { id: string }) => {
            const { id, ...rest } = data;
            return api<Photo>("/api/photos/" + id, { method: "PUT", body: JSON.stringify(rest) })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPhotos"] })
            queryClient.invalidateQueries({ queryKey: ["photos"] })
        }
    })
}

export function useDeletePhoto() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api<void>("/api/photos/" + id, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPhotos"] })
            queryClient.invalidateQueries({ queryKey: ["photos"] })
        }
    })
}