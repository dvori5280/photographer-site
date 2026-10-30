import {  useState } from "react";
import { useAdminPhotos } from "../../hooks/useAdminPhotos";
import { useDeletePhoto } from "../../hooks/usePhotoMutations";
import type { Photo } from "../../types";
import PhotoForm from "../../components/PhotoForm";

export default function AdminGalleryPage() {

    const photosQuery = useAdminPhotos();
    const deletePhoto = useDeletePhoto();
    const [editing, setEditing] = useState<Photo | undefined>(undefined);

  

    return (
        <div>
            <h3 className="mb-4 text-2xl font-bold">ניהול גלריה</h3>
            <PhotoForm key={editing?.id ?? "new"} photo={editing} onDone={() => setEditing(undefined)} />
            {photosQuery.isLoading && <p className="text-muted">טוען תמונות...</p>}
            {photosQuery.isError && <p className="form-error">{photosQuery.error.message}</p>}
            {photosQuery.data?.length === 0 && <p className="text-muted">אין תמונות עדיין</p>}
            {deletePhoto.isError && <p className="form-error mb-3">{deletePhoto.error.message}</p>}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {photosQuery.data?.map(p => (
                    <div key={p.id} className="overflow-hidden rounded-2xl bg-white shadow-md">
                        <img className="h-44 w-full object-cover" src={p.imageUrl} alt={p.title} />
                        <div className="space-y-1 p-4">
                            <p className="font-bold">{p.title}</p>
                            <p className="text-sm text-muted">{p.category.name}</p>
                            {p.isPublished
                                ? <span className="rounded-full bg-ok/15 px-3 py-0.5 text-xs text-ok">מפורסמת</span>
                                : <span className="rounded-full bg-sand px-3 py-0.5 text-xs text-muted">מוסתרת</span>}
                            <div className="flex gap-2 pt-2">
                                <button
                                    className="rounded-full border border-rose px-4 py-1 text-sm text-rose-dark transition hover:bg-sand"
                                    onClick={() => setEditing(p)}
                                >
                                    עריכה
                                </button>
                                <button
                                    className="rounded-full border border-red-300 px-4 py-1 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                    onClick={() => deletePhoto.mutate(p.id)}
                                    disabled={deletePhoto.isPending}
                                >
                                    מחיקה
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}