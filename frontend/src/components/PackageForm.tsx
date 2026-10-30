import type { Package } from "../types";
import { useCreatePackage, useUpdatePackage } from "../hooks/usePackageMutations";
import { useCategories } from "../hooks/useCategories";
import { useState } from "react";
import { useForm } from "react-hook-form";
import FormField from "./FormField";
import { useScrollToTopWhen } from "../hooks/useScrollToTopWhen";




type Props = {
    pkg?: Package;
    onDone: () => void;
};

type PackageFormData = {
    name: string,
    description: string,
    categoryId: string,
    imageUrl: string,
    basePrice: number,
    durationMinutes: number,
    includedItems: string,
    isActive: boolean,
}

export default function PackageForm({ pkg, onDone }: Props) {

    const createPackage = useCreatePackage();
    const updatePackage = useUpdatePackage();
    const categoriesQuery = useCategories();
    const [serverError, setServerError] = useState("");

    useScrollToTopWhen(pkg);


    const { register, handleSubmit, reset, formState: { errors } } = useForm<PackageFormData>({
        defaultValues: {
            name: pkg?.name ?? "",
            description: pkg?.description ?? "",
            categoryId: pkg?.category.id ?? "",
            imageUrl: pkg?.imageUrl ?? "",
            basePrice: pkg?.basePrice,
            durationMinutes: pkg?.durationMinutes,
            includedItems: pkg?.includedItems.join("\n") ?? "",
            isActive: pkg?.isActive ?? true,
        },
    });


    const onSubmit = async (data: PackageFormData) => {
        setServerError("");
        try {
            const includedItems = data.includedItems
                .split("\n")
                .map(item => item.trim())
                .filter(item => item !== "");
            if (pkg) {
                await updatePackage.mutateAsync(
                    {
                        id: pkg.id,
                        name: data.name,
                        description: data.description,
                        categoryId: data.categoryId,
                        imageUrl: data.imageUrl || null,
                        basePrice: data.basePrice,
                        durationMinutes: data.durationMinutes,
                        includedItems: includedItems,
                        isActive: data.isActive,
                    }
                )
            }
            else {
                await createPackage.mutateAsync({
                    name: data.name,
                    description: data.description,
                    categoryId: data.categoryId,
                    imageUrl: data.imageUrl || undefined,
                    basePrice: data.basePrice,
                    durationMinutes: data.durationMinutes,
                    includedItems: includedItems,
                    isActive: data.isActive,
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
            <h3 className="text-xl font-bold">{pkg ? "עריכת חבילה" : "הוספת חבילה"}</h3>

            <FormField label="שם" error={errors.name?.message}>
                <input className="field" type="text" {...register("name", {
                    required: "יש להזין שם",
                    minLength: { value: 2, message: "לפחות 2 תווים" },
                    maxLength: { value: 80, message: "עד 80 תווים" },
                })} />
            </FormField>
            <FormField label="תיאור" error={errors.description?.message}>
                <textarea className="field min-h-24" {...register("description", {
                    required: "יש להזין תיאור",
                    minLength: { value: 2, message: "לפחות 2 תווים" },
                    maxLength: { value: 1000, message: "עד 1000 תווים" },
                })} />
            </FormField>
            <FormField label="קטגוריה" error={errors.categoryId?.message}>
                <select className="field" {...register("categoryId", {
                    required: "יש לבחור קטגוריה"
                })}>
                    <option value="">בחרי קטגוריה</option>
                    {categoriesQuery.data?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
            </FormField>
            <FormField label="מחיר (בשקלים)" error={errors.basePrice?.message}>
                <input className="field" type="number" step={0.01} {...register("basePrice", {
                    required: "יש להזין מחיר",
                    valueAsNumber: true,
                    min: { value: 1, message: "לפחות 1 ש״ח" },
                })} />
            </FormField>
            <FormField label="משך הצילום (בדקות)" error={errors.durationMinutes?.message}>
                <input className="field" type="number" {...register("durationMinutes", {
                    required: "יש להזין משך",
                    valueAsNumber: true,
                    min: { value: 1, message: "לפחות דקה אחת" },
                    max: { value: 1440, message: "עד 1440 דקות" },
                })} />
            </FormField>
            <FormField label="כתובת תמונה (לא חובה)">
                <input className="field" type="text" {...register("imageUrl")} />
            </FormField>
            <FormField label="מה כלול בחבילה (פריט בכל שורה)" error={errors.includedItems?.message}>
                <textarea className="field min-h-24" {...register("includedItems", {
                    required: "יש להזין לפחות פריט אחד",
                    validate: (value) =>
                        value.split("\n").some(item => item.trim() !== "") || "יש להזין לפחות פריט אחד",
                })} />
            </FormField>
            <label className="mt-2 flex items-center gap-2 text-sm">
                <input type="checkbox" {...register("isActive")} />
                חבילה פעילה (מוצגת באתר)
            </label>

            {serverError && <p className="form-error">{serverError}</p>}

            <div className="mt-3 flex gap-3">
                <button className="btn" type="submit" disabled={createPackage.isPending || updatePackage.isPending}>
                    שמירה
                </button>
                {pkg && <button className="btn-outline" type="button" onClick={onDone}>ביטול</button>}
            </div>
        </form>
    )

}