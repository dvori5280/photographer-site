import { useState } from "react";
import { useAdminBookings } from "../../hooks/useAdminBookings";
import type { BookingStatus, EventType } from "../../types";
import { eventTypeLabels, bookingStatusLabels } from "../../utils/labels";
import { formatDate, formatPrice } from "../../utils/format";
import { useUpdateBookingStatus } from "../../hooks/useUpdateBookingStatus";
import StatusSelect from "../../components/StatusSelect";

export default function AdminBookingsPage() {

    const [status, setStatus] = useState<BookingStatus | undefined>(undefined);
    const [eventType, setEventType] = useState<EventType | undefined>(undefined);

    const bookingsQuery = useAdminBookings(status, eventType);
    const updateStatus = useUpdateBookingStatus();

    return (
        <div>
            <h3 className="mb-4 text-2xl font-bold">ניהול הזמנות</h3>
            <div className="mb-5 flex flex-wrap gap-3">
                <select className="field w-auto" value={status ?? ""} onChange={(e) => setStatus(e.target.value as BookingStatus || undefined)}>
                    <option value="">כל הסטטוסים</option>
                    {Object.entries(bookingStatusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
                <select className="field w-auto" value={eventType ?? ""} onChange={(e) => setEventType(e.target.value as EventType || undefined)}>
                    <option value="">כל סוגי האירועים</option>
                    {Object.entries(eventTypeLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
            {updateStatus.isError && <p className="form-error">{updateStatus.error.message}</p>}
            {bookingsQuery.isLoading && <p className="text-muted">טוען הזמנות...</p>}
            {bookingsQuery.isError && <p className="form-error">{bookingsQuery.error.message}</p>}
            {bookingsQuery.data?.length === 0 && <p className="text-muted">לא נמצאו הזמנות</p>}
            <div className="grid gap-4 md:grid-cols-2">
                {bookingsQuery.data?.map(b => (
                    <div key={b.id} className="rounded-2xl bg-white p-5 shadow-md">
                        <div className="mb-3 flex items-start justify-between gap-2 border-b border-sand pb-3">
                            <p className="text-lg font-bold">{b.package.name}</p>
                            <StatusSelect
                                value={updateStatus.isPending && updateStatus.variables?.id === b.id ? updateStatus.variables.status : b.status}
                                labels={bookingStatusLabels}
                                disabled={updateStatus.isPending}
                                onChange={(status) => updateStatus.mutate({ id: b.id, status })}
                            />
                        </div>
                        <div className="space-y-1 text-sm">
                            <p><span className="text-muted">לקוחה: </span>{b.customer?.name}</p>
                            <p><span className="text-muted">אימייל: </span>{b.customer?.email}</p>
                            <p><span className="text-muted">תאריך: </span>{formatDate(b.requestedDate)}</p>
                            <p><span className="text-muted">סוג אירוע: </span>{eventTypeLabels[b.eventType]}</p>
                            <p><span className="text-muted">מיקום: </span>{b.location}</p>
                            <p><span className="text-muted">טלפון: </span>{b.phone}</p>
                            {b.notes && <p><span className="text-muted">הערות: </span>{b.notes}</p>}
                        </div>
                        <p className="mt-3 font-bold text-rose-dark">{formatPrice(b.priceAtRequest)}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}