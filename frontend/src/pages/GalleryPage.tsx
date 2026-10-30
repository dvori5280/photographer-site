import { useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { usePhotos } from "../hooks/usePhotos";
import PhotoCard from "../components/PhotoCard";

export default function GalleryPage()
{

    const [categoryId, setCategoryId] = useState<string | undefined>(undefined);

    const categoriesQuery = useCategories();
    const photosQuery = usePhotos(categoryId);
    
    const photos = photosQuery.data;
    
    if (photosQuery.isLoading) 
        return <p className="py-10 text-center text-muted">טוען תמונות...</p>;
    if (photosQuery.isError) 
        return <p className="py-10 text-center text-red-700">{photosQuery.error.message}</p>;
    if (!photos) return null;
    
    return (
        <div>
            <h1 className="page-title">גלריה</h1>
            <div className="mb-6 flex justify-center">
            <select className="field w-auto" value={categoryId ?? ""} onChange={(e)=>setCategoryId(e.target.value || undefined)}>
                <option value = "">כל הקטגוריות</option>
                {categoriesQuery.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            </div>
            {photos.length === 0? <p className="text-center text-muted">לא נמצאו תמונות</p> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{photos.map(d => <PhotoCard key={d.id} photo={d} />)}</div>}
        </div>
        
    )
}