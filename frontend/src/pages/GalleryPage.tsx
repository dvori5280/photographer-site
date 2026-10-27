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
    if (!photos) return null;

    if (photosQuery.isLoading) 
        return <p>טוען תמונות...</p>;
    if (photosQuery.isError) 
        return <p>{photosQuery.error.message}</p>;

    return (
        <div>
            <h1>גלריה</h1>
            <select value={categoryId ?? ""} onChange={(e)=>setCategoryId(e.target.value || undefined)}>
                <option value = "">כל הקטגוריות</option>
                {categoriesQuery.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {photos.length === 0? <p>לא נמצאו תמונות</p> : <div>{photos.map(d => <PhotoCard key={d.id} photo={d} />)}</div>}
        </div>
        
    )
}