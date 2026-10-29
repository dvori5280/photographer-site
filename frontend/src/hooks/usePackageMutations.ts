import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Package } from "../types";
import { api } from "../api/client";




export type PackageInput = {
    categoryId: string,
    name: string,
    description: string,
    imageUrl?: string | null,
    isActive?: boolean
    includedItems: string[],
    basePrice: number,
    durationMinutes: number,
}


export function useCreatePackage() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: PackageInput) => api<Package>("/api/packages", { method: "POST", body: JSON.stringify(data) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPackages"] })
            queryClient.invalidateQueries({ queryKey: ["packages"] })
        }
    })
}

export function useUpdatePackage() {

    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: PackageInput & { id: string }) => {
            const { id, ...rest } = data;
            return api<Package>("/api/packages/" + id, { method: "PUT", body: JSON.stringify(rest) })
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPackages"] })
            queryClient.invalidateQueries({ queryKey: ["packages"] })
        }
    })
}

export function useDeletePackage() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api<void>("/api/packages/" + id, { method: "DELETE" }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["adminPackages"] })
            queryClient.invalidateQueries({ queryKey: ["packages"] })
        }
    })
}