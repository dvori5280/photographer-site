import { useCreateCategory, useUpdateCategory } from "../hooks/useCategoryMutations";
import type { Category } from "../types";
import FormField from "./FormField";
import { useScrollToTopWhen } from "../hooks/useScrollToTopWhen";
import { useState } from "react";
import { useForm } from "react-hook-form";

type Props = {
    category?: Category;
    onDone: () => void;
};

type CategoryFormData = {
    name: string;
    description: string;
};

export default function CategoryForm({ category, onDone }: Props) {

    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const [serverError, setServerError] = useState("");

    useScrollToTopWhen(category);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormData>({
        defaultValues: {
            name: category?.name ?? "",
            description: category?.description ?? "",
        },
    });

    const onSubmit = async (data: CategoryFormData) => {
        setServerError("");
        try {
            if (category) {
                await updateCategory.mutateAsync(
                    {
                        id: category.id,
                        name: data.name,
                        description: data.description || null
                    }
                )
            }
            else {
                await createCategory.mutateAsync({
                    name: data.name,
                    description: data.description || undefined
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
            <h3 className="text-xl font-bold">{category ? "עריכת קטגוריה" : "הוספת קטגוריה"}</h3>
            <FormField label="שם" error={errors.name?.message}>
                <input className="field" type="text" {...register("name", {
                    required: "יש להזין שם",
                    minLength: { value: 2, message: "לפחות 2 תווים" },
                    maxLength: { value: 60, message: "עד 60 תווים" },
                })} />
            </FormField>
            <FormField label="תיאור (לא חובה)" error={errors.description?.message}>

                <textarea className="field min-h-24" {...register("description", {
                    maxLength: { value: 300, message: "עד 300 תווים" },
                })} />
            </FormField>
            {serverError && <p className="form-error">{serverError}</p>}
            <div className="mt-3 flex gap-3">
                <button className="btn" type="submit" disabled={createCategory.isPending || updateCategory.isPending}>שמירה</button>
                {category && <button className="btn-outline" type="button" onClick={onDone}>ביטול</button>}
            </div>
        </form>
    )
}