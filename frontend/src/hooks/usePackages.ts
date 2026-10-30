import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Package } from "../types";


export function usePackages(categoryId?: string, sort?: "price_asc" | "price_desc") {
    const params = new URLSearchParams();
    categoryId && params.set("categoryId", categoryId);
    sort && params.set("sort", sort);
    const url = "/api/packages?" + params.toString();

    return useQuery({
        placeholderData: keepPreviousData,
        queryKey: ["packages", categoryId, sort],
        queryFn: () => api<Package[]>(url),
    });
}