import { useMyBookings } from "../hooks/useMyBookings";
import { formatDate, formatPrice } from "../utils/format";
import { eventTypeLabels, bookingStatusLabels } from "../utils/labels";
import { Link } from "react-router-dom";


export default function MyBookingsPage()
{
    const bookingsQuery = useMyBookings();

    if(bookingsQuery.isLoading) return <p>טוען הזמנות....</p>
    if(bookingsQuery.isError) return <p>{bookingsQuery.error.message}</p>
    const bookings=bookingsQuery.data;
    if(!bookings) return null;

    return (
        <div>
            <h1>ההזמנות שלי</h1>
            {bookings.length === 0 ? <p>עוד לא שלחת בקשות, אפשר לבחור חבילה<Link to="/packages">חבילות צילום</Link></p>: 
                                    bookings.map(b=><div key={b.id}>
                                            <p>{b.package.name}</p>
                                            <p>{formatDate(b.requestedDate)}</p>
                                            <p>{eventTypeLabels[b.eventType]}</p>
                                            <p>{b.location}</p>
                                            <p>{bookingStatusLabels[b.status]}</p>
                                            <p>{formatPrice(b.priceAtRequest)} מחיר בעת הבקשה</p>
                                        </div>)}
        </div>
    )
}