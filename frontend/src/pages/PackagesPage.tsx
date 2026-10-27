import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { usePackages } from "../hooks/usePackages";
import PackageCard from "../components/PackageCard";

export default function PackagesPage()
{
    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);
    const [sort, setSort] = useState<"price_asc" | "price_desc" | undefined>(undefined);


    const categoriesQuery = useCategories();
    const packagesQuery = usePackages(categoryId, sort);

    if (packagesQuery.isLoading) 
        return <p>טוען חבילות...</p>;
    if (packagesQuery.isError) 
        return <p>{packagesQuery.error.message}</p>;
    const packages = packagesQuery.data;
    if (!packages) return null;

    return (
        <div>
            <h1>חבילות צילום</h1>
            <select value={categoryId ?? ""} onChange={(e)=>setCategoryId(e.target.value || undefined)}>
                <option value = "">כל הקטגוריות</option>
                {categoriesQuery.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={sort ?? ""} onChange={(e)=>  setSort((e.target.value || undefined) as "price_asc" | "price_desc" | undefined)}>
                <option value="">ללא מיון</option>
                <option value="price_asc">מחיר: מהנמוך לגבוה</option>
                <option value="price_desc">מחיר: מהגבוה לנמוך</option>
            </select>
            {packages.length === 0? <p>לא נמצאו חבילות</p> : <div>{packages.map(d => <PackageCard key={d.id} pkg={d} />)}</div>}
        </div>
    )
}