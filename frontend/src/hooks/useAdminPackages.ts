import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Package } from "../types";


export function useAdminPackages(categoryId?: string, isActive?: boolean) {

    const params = new URLSearchParams();
    if (isActive !== undefined)
        params.set("isActive", String(isActive));
    categoryId && params.set("categoryId", categoryId);
    const url = "/api/admin/packages?" + params.toString();

    return useQuery({
        queryKey: ["adminPackages", categoryId, isActive],
        queryFn: () => api<Package[]>(url),
    })
}