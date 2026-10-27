import {useParams, Link} from "react-router-dom"
import { usePackage } from "../hooks/usePackage";
import { formatPrice, formatDuration } from "../utils/format";


export default function PackageDetailsPage()
{
    const { id } = useParams();
    const packageQuery = usePackage(id ?? "");

    if (packageQuery.isLoading) 
        return <p>טוען חבילות...</p>;
    if (packageQuery.isError) 
        return <p>{packageQuery.error.message}</p>;

    const pkg = packageQuery.data;
    if (!pkg) return null;

    return (
        <div>
            <h1>חבילת צילום - פרטים</h1>
            {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name}/>}
            <h2>{pkg.category.name + " " + pkg.name}</h2>
            <p>{pkg.description}</p>
            <p>{formatPrice(pkg.basePrice)}</p>
            <p>{formatDuration(pkg.durationMinutes)}</p>
            <ul>{pkg.includedItems.map(item=><li key={item}>{item}</li>)} </ul>
            <Link to={"/book/" + pkg.id}>להזמנת חבילה</Link>
            <Link to="/packages">חזרה לחבילות</Link>

        </div>
    )
}