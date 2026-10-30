import { useEffect, useState } from "react";
import { useCategories } from "../hooks/useCategories";
import { useCreatePhoto, useUpdatePhoto } from "../hooks/usePhotoMutations";
import type { Photo } from "../types";
import { useForm } from "react-hook-form";



type Props = {
    photo?: Photo;
    onDone: () => void;
}

type PhotoFormData = {
    title: string,
    imageUrl: string,
    categoryId: string,
    description?: string | null,
    takenAt?: string | null,
    isPublished?: boolean,
}


export default function PhotoForm({ photo, onDone }: Props) {
    const createPhoto = useCreatePhoto();
    const updatePhoto = useUpdatePhoto();
    const categories = useCategories();
    const [serverError, setServerError] = useState("");

      useEffect(() => {
    if (photo) window.scrollTo({ top: 0, behavior: "smooth" });
}, [photo]);


    const { register, handleSubmit, reset, formState: { errors } } = useForm<PhotoFormData>({
        defaultValues: {
            title: photo?.title ?? "",
            imageUrl: photo?.imageUrl ?? "",
            categoryId: photo?.category.id ?? "",
            description: photo?.description ?? "",
            takenAt: photo?.takenAt ?? "",
            isPublished: photo?.isPublished ?? true,
        },
    });


    const onSubmit = async (data: PhotoFormData) => {
        setServerError("");
        try {
            if (photo) {
                await updatePhoto.mutateAsync(
                    {
                        id: photo.id,
                        title: data.title,
                        imageUrl: data.imageUrl,
                        categoryId: data.categoryId,
                        description: data.description || null,
                        takenAt: data.takenAt || null,
                        isPublished: data.isPublished,
                    }
                )
            }
            else {
                await createPhoto.mutateAsync({
                    title: data.title,
                    imageUrl: data.imageUrl,
                    categoryId: data.categoryId,
                    description: data.description || undefined,
                    takenAt: data.takenAt || undefined,
                    isPublished: data.isPublished,
                })
            }
            reset();
            onDone();
        }
        catch (error) {
            setServerError(error instanceof Error ? error.message : "שגיאה")
        }

    }

    return (
        <form className="form-card mb-8 !mx-0 !max-w-none" onSubmit={handleSubmit(onSubmit)}>
            <h3 className="text-xl font-bold">{photo ? "עריכת תמונה" : "הוספת תמונה"}</h3>

            <label className="form-label">כותרת</label>
            <input className="field" type="text" {...register("title", {
                required: "יש להזין כותרת",
                minLength: { value: 2, message: "לפחות 2 תווים" },
                maxLength: { value: 80, message: "עד 80 תווים" },
            })} />
            {errors.title && <p className="form-error">{errors.title.message}</p>}

            <label className="form-label">תיאור (לא חובה)</label>
            <textarea className="field min-h-24" {...register("description", {
                minLength: { value: 2, message: "לפחות 2 תווים" },
                maxLength: { value: 500, message: "עד 500 תווים" },
            })} />
            {errors.description && <p className="form-error">{errors.description.message}</p>}
            <label className="form-label">כתובת התמונה</label>
            <input className="field" type="text" {...register("imageUrl", {
                required: "יש להזין כתובת תמונה",
                pattern: { value: /^https?:\/\//, message: "יש להזין כתובת תקינה שמתחילה ב־http" }
            })}/>
            {errors.imageUrl && <p className="form-error">{errors.imageUrl.message}</p>}
            <label className="form-label">קטגוריה</label>
            <select className="field" {...register("categoryId", {
                required: "יש לבחור קטגוריה"
            })}>
                <option value="">בחרי קטגוריה</option>
                {categories.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.categoryId && <p className="form-error">{errors.categoryId.message}</p>}
            <label className="form-label">תאריך צילום (לא חובה)</label>
            <input className="field" type="date" {...register("takenAt")}/>
            (לא חובה)
            {serverError && <p className="form-error">{serverError}</p>}
            <label className="form-label">
            <input type="checkbox" {...register("isPublished")}/>
            פרסום התמונה
            </label>
            <div className="mt-3 flex gap-3">
                <button className="btn" type="submit" disabled={createPhoto.isPending || updatePhoto.isPending}>
                    שמירה
                </button>
                {photo && <button className="btn-outline" type="button" onClick={onDone}>ביטול</button>}

            </div>
        </form>
    )

}