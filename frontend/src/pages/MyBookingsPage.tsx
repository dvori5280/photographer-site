import { useMyBookings } from "../hooks/useMyBookings";
import { formatDate, formatPrice } from "../utils/format";
import { eventTypeLabels, bookingStatusLabels } from "../utils/labels";
import { Link } from "react-router-dom";


export default function MyBookingsPage()
{
    const bookingsQuery = useMyBookings();

    if(bookingsQuery.isLoading) return <p className="py-10 text-center text-muted">טוען הזמנות....</p>
    if(bookingsQuery.isError) return <p className="py-10 text-center text-red-700">{bookingsQuery.error.message}</p>
    const bookings=bookingsQuery.data;
    if(!bookings) return null;

    return (
        <div className="mx-auto max-w-2xl">
            <h1 className="page-title">ההזמנות שלי</h1>
            {bookings.length === 0 ? <p className="text-center">עוד לא שלחת בקשות, אפשר לבחור חבילה<Link className="mr-1 text-rose-dark underline" to="/packages">חבילות צילום</Link></p>: 
                                    bookings.map(b=><div className="mb-4 rounded-2xl bg-white p-5 shadow-md" key={b.id}>
                                            <p className="text-lg font-bold">{b.package.name}</p>
                                            <p>{formatDate(b.requestedDate)}</p>
                                            <p>{eventTypeLabels[b.eventType]}</p>
                                            <p>{b.location}</p>
                                            <p className="my-1 w-fit rounded-full bg-sand px-3 py-0.5 text-sm">{bookingStatusLabels[b.status]}</p>
                                            <p className="text-sm font-bold text-rose-dark">{formatPrice(b.priceAtRequest)} מחיר בעת הבקשה</p>
                                        </div>)}
        </div>
    )
}