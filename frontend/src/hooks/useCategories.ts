import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Category } from "../types";

export function useCategories() {
    return useQuery({
  queryKey: ["categories"],
  queryFn: () => api<Category[]>("/api/categories"),
});
}