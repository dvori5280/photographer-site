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
            <h1>הזמנת {pkg.name}</h1>
            <p>מחיר: {formatPrice(pkg.basePrice)}</p>
            <p>זו בקשה ולא הזמנה מאושרת. הצלמת תחזור אלייך לאישור.</p>
            <form onSubmit={handleSubmit(onSubmit)}>
                <label>תאריך האירוע</label>
                <input type="date" min={today} {...register("requestedDate", { required: "יש לבחור תאריך" })} />
                {errors.requestedDate && <p>{errors.requestedDate.message}</p>}
                <label>סוג אירוע</label>
                <select {...register("eventType", { required: "יש לבחור סוג אירוע" })}>
                  <option value="">בחרי סוג אירוע</option>
                  {Object.entries(eventTypeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                {errors.eventType && <p>{errors.eventType.message}</p>}
                <label>מיקום</label>
                <input type="text" {...register("location", { required: "יש להזין מיקום", minLength: { value: 2, message: "לפחות 2 תווים" } })} />
                {errors.location && <p>{errors.location.message}</p>}
                <label>טלפון</label>
                <input type="tel" {...register("phone", { required: "יש להזין טלפון", pattern: { value: /^(\+972|0)[-\s]?\d{1,2}[-\s]?\d{7}$/, message: "טלפון לא תקין" } })} />
                {errors.phone && <p>{errors.phone.message}</p>}
                <label>הערות</label>
                <textarea {...register("notes", { maxLength: { value: 1000, message: "עד 1000 תווים" } })} />
                {errors.notes && <p>{errors.notes.message}</p>}
                {serverError && <p>{serverError}</p>}
                <button type="submit" disabled={createBooking.isPending}>{createBooking.isPending ? "שולחת..." : "שליחת בקשה"}</button>
            </form>
            <Link to={"/packages/" + pkg.id}>חזרה לפרטי החבילה</Link>
        </div>
    )
}