import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { usePackage } from "../hooks/usePackage";
import { useCreateBooking } from "../hooks/useCreateBooking";
import { formatPrice } from "../utils/format";
import { eventTypeLabels } from "../utils/labels";
import type { EventType } from "../types";


type BookingForm = { 
    requestedDate: string; 
    eventType: EventType; 
    location: string; 
    phone: string; 
    notes: string 
};




export default function BookingPage()
{

    const { packageId } = useParams();
    const packageQuery = usePackage(packageId ?? "");
    const createBooking = useCreateBooking();
    const navigate = useNavigate();
    const [serverError, setServerError] = useState("");
    const { register, handleSubmit, formState: { errors } } = useForm<BookingForm>();
    const today = new Date().toISOString().slice(0, 10);


    if (packageQuery.isLoading) return <p>טוען חבילה...</p>;
    if (packageQuery.isError) return <p>{packageQuery.error.message}</p>;
    const pkg = packageQuery.data;
    if (!pkg) return null;


    const onSubmit = async (data: BookingForm) => {
    setServerError("");
    try {
      await createBooking.mutateAsync({
        packageId: pkg.id,
        requestedDate: data.requestedDate,
        eventType: data.eventType,
        location: data.location,
        phone: data.phone,
        notes: data.notes || undefined,
      });
      navigate("/my-bookings");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "שגיאה");
    }
}


    return (
        <div>
            <h1 className="page-title">הזמנת {pkg.name}</h1>
            <p className="text-center text-xl font-bold text-rose-dark">מחיר: {formatPrice(pkg.basePrice)}</p>
            <p className="mb-6 text-center text-sm text-muted">זו בקשה ולא הזמנה מאושרת. הצלמת תחזור אלייך לאישור.</p>
            <form className="form-card" onSubmit={handleSubmit(onSubmit)}>
                <label className="form-label">תאריך האירוע</label>
                <input className="field" type="date" min={today} {...register("requestedDate", { required: "יש לבחור תאריך" })} />
                {errors.requestedDate && <p className="form-error">{errors.requestedDate.message}</p>}
                <label className="form-label">סוג אירוע</label>
                <select className="field" {...register("eventType", { required: "יש לבחור סוג אירוע" })}>
                  <option value="">בחרי סוג אירוע</option>
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.eventType && <p className="form-error">{errors.eventType.message}</p>}
                <label className="form-label">מיקום</label>
                <input className="field" type="text" {...register("location", { required: "יש להזין מיקום", minLength: { value: 2, message: "לפחות 2 תווים" } })} />
                {errors.location && <p className="form-error">{errors.location.message}</p>}
                <label className="form-label">טלפון</label>
                <input className="field" type="tel" {...register("phone", { required: "יש להזין טלפון", pattern: { value: /^(\+972|0)[-\s]?\d{1,2}[-\s]?\d{7}$/, message: "טלפון לא תקין" } })} />
                {errors.phone && <p className="form-error">{errors.phone.message}</p>}
                <label className="form-label">הערות</label>
                <textarea className="field min-h-28" {...register("notes", { maxLength: { value: 1000, message: "עד 1000 תווים" } })} />
                {errors.notes && <p className="form-error">{errors.notes.message}</p>}
                {serverError && <p className="form-error">{serverError}</p>}
                <button className="btn mt-4" type="submit" disabled={createBooking.isPending}>{createBooking.isPending ? "שולחת..." : "שליחת בקשה"}</button>
                {createBooking.isPending && <p className="text-center text-sm text-muted">השרת מתעורר, זה יכול לקחת עד דקה...</p>}
            </form>
            <Link className="mt-4 block text-center text-sm text-rose-dark underline" to={"/packages/" + pkg.id}>חזרה לפרטי החבילה</Link>
        </div>
    )
}