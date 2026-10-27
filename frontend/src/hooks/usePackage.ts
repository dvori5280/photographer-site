import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Package } from "../types";



export function usePackage(id:string) {

    return useQuery({
        queryKey: ["package", id],
        queryFn: ()=>api<Package>("/api/packages/" + id),
        enabled: !!id,
    })
}