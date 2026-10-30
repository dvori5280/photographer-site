import { useState } from "react";
import type { ContactStatus } from "../../types";
import { useAdminMessages } from "../../hooks/useAdminMessages";
import { useUpdateMessageStatus } from "../../hooks/useUpdateMessageStatus";
import { contactStatusLabels } from "../../utils/labels";
import { formatDate } from "../../utils/format";
import StatusSelect from "../../components/StatusSelect";

export default function AdminMessagesPage() {

    const [status, setStatus] = useState<ContactStatus | undefined>(undefined);
    const messagesQuery = useAdminMessages(status);
    const updateStatus = useUpdateMessageStatus();

    return (
        <div>
            <h3 className="mb-4 text-2xl font-bold">ניהול הודעות</h3>
            <div className="mb-5">
                <select className="field w-auto" value={status ?? ""} onChange={(e) => setStatus(e.target.value as ContactStatus || undefined)}>
                    <option value="">כל הסטטוסים</option>
                    {Object.entries(contactStatusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            {messagesQuery.isLoading && <p className="text-muted">טוען הודעות...</p>}
            {messagesQuery.isError && <p className="form-error">{messagesQuery.error.message}</p>}
            {updateStatus.isError && <p className="form-error">{updateStatus.error.message}</p>}
            {messagesQuery.data?.length === 0 && <p className="text-muted">לא נמצאו הודעות</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {messagesQuery.data?.map(m => (
                    <div key={m.id} className="rounded-2xl bg-white p-5 shadow-md">
                        <div className="mb-3 flex items-start justify-between gap-2 border-b border-sand pb-3">
                            <p className="text-lg font-bold">{m.subject}</p>
                            <StatusSelect
                                value={updateStatus.isPending && updateStatus.variables?.id === m.id ? updateStatus.variables.status : m.status}
                                labels={contactStatusLabels}
                                disabled={updateStatus.isPending}
                                onChange={(status) => updateStatus.mutate({ id: m.id, status })}
                            />
                        </div>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted">שם: </span>{m.name}</p>
                            <p><span className="text-muted">אימייל: </span>{m.email}</p>
                            {m.phone && <p><span className="text-muted">טלפון: </span>{m.phone}</p>}
                            <p><span className="text-muted">תאריך: </span>{formatDate(m.createdAt)}</p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap rounded-xl bg-cream p-3 text-sm">{m.message}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}