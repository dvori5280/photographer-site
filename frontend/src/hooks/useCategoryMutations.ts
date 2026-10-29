import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Category } from "../types";



export type CategoryInput = {
    name: string;
    description?: string | null;
};

export type UpdateCategoryInput = {
    id: string;
    name: string;
    description?: string | null;
};

export function useCreateCategory() {

    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CategoryInput) => api<Category>("/api/categories", { method: "POST", body: JSON.stringify(data) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
    })
}

export function useUpdateCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: UpdateCategoryInput) => api<Category>("/api/categories/" + data.id, { method: "PUT", body: JSON.stringify({ name: data.name, description: data.description }) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
    })
}

export function useDeleteCategory() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => api<void>("/api/categories/" + id, { method: "DELETE" }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] })
    })
}