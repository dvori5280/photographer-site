import { useState } from "react";
import { useAdminPackages } from "../../hooks/useAdminPackages";
import { useDeletePackage } from "../../hooks/usePackageMutations";
import type { Package } from "../../types";
import PackageForm from "../../components/PackageForm";
import { formatDuration, formatPrice } from "../../utils/format";

export default function AdminPackagesPage() {

    const packagesQuery = useAdminPackages();
    const deletePackage = useDeletePackage();
    const [editing, setEditing] = useState<Package | undefined>(undefined);

    return (
        <div>
            <h3 className="mb-4 text-2xl font-bold">ניהול חבילות</h3>
            <PackageForm key={editing?.id ?? "new"}
                pkg={editing}
                onDone={() => setEditing(undefined)} />
            {packagesQuery.isLoading && <p className="text-muted">טוען חבילות...</p>}
            {packagesQuery.isError && <p className="form-error">{packagesQuery.error.message}</p>}
            {packagesQuery.data?.length === 0 && <p className="text-muted">אין חבילות עדיין</p>}
            {deletePackage.isError && <p className="form-error mb-3">{deletePackage.error.message}</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {packagesQuery.data?.map(p => (
                    <div key={p.id} className="flex items-start justify-between gap-3 rounded-2xl bg-white p-5 shadow-md">
                        <div className="space-y-1">
                            <p className="text-lg font-bold">{p.name}</p>
                            <p className="text-sm text-muted">{p.category.name}</p>
                            <p className="font-bold text-rose-dark">{formatPrice(p.basePrice)}</p>
                            <p className="text-sm">{formatDuration(p.durationMinutes)}</p>
                            {p.isActive
                                ? <span className="rounded-full bg-ok/15 px-3 py-0.5 text-xs text-ok">פעילה</span>
                                : <span className="rounded-full bg-sand px-3 py-0.5 text-xs text-muted">מושבתת</span>}
                        </div>
                        <div className="flex shrink-0 gap-2">
                            <button
                                className="rounded-full border border-rose px-4 py-1 text-sm text-rose-dark transition hover:bg-sand"
                                onClick={() => setEditing(p)}
                            >
                                עריכה
                            </button>
                            <button
                                className="rounded-full border border-red-300 px-4 py-1 text-sm text-red-700 transition hover:bg-red-50 disabled:opacity-60"
                                onClick={() => deletePackage.mutate(p.id)}
                                disabled={deletePackage.isPending}
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