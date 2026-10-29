import { useState } from "react";
import { useCategories } from "../../hooks/useCategories";
import { useDeleteCategory } from "../../hooks/useCategoryMutations";
import type { Category } from "../../types";
import CategoryForm from "../../components/CategoryForm";

export default function AdminCategoriesPage() {

    const categoriesQuery = useCategories();
    const deleteCategory = useDeleteCategory();

    const [editing, setEditing] = useState<Category | undefined>(undefined);

    return (
        <div>
            <h3 className="mb-4 text-2xl font-bold">ניהול קטגוריות</h3>
            <CategoryForm key={editing?.id ?? "new"} category={editing} onDone={() => setEditing(undefined)} />
            {categoriesQuery.isLoading && <p className="text-muted">טוען קטגוריות...</p>}
            {categoriesQuery.isError && <p className="form-error">{categoriesQuery.error.message}</p>}
            {categoriesQuery.data?.length === 0 && <p className="text-muted">אין קטגוריות עדיין</p>}
            {deleteCategory.isError && <p className="form-error mb-3">{deleteCategory.error.message}</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {categoriesQuery.data?.map(c => (
                    <div key={c.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-md">
                        <div>
                            <p className="text-lg font-bold">{c.name}</p>
                            {c.description && <p className="mt-1 text-sm text-muted">{c.description}</p>}
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button
                                className="rounded-full border border-rose px-4 py-1 text-sm text-rose-dark transition hover:bg-sand"
                                onClick={() => setEditing(c)}
                            >
                                עריכה
                            </button>
                            <button
                                className="rounded-full border border-red-300 px-4 py-1 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                onClick={() => deleteCategory.mutate(c.id)}
                                disabled={deleteCategory.isPending}
                            >
                                מחיקה
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}