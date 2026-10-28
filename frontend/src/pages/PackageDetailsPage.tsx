import {useParams, Link} from "react-router-dom"
import { usePackage } from "../hooks/usePackage";
import { formatPrice, formatDuration } from "../utils/format";


export default function PackageDetailsPage()
{
    const { id } = useParams();
    const packageQuery = usePackage(id ?? "");

    if (packageQuery.isLoading) 
        return <p className="py-10 text-center text-muted">טוען חבילות...</p>;
    if (packageQuery.isError) 
        return <p className="py-10 text-center text-red-700">{packageQuery.error.message}</p>;

    const pkg = packageQuery.data;
    if (!pkg) return null;

    return (
        <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-white shadow-md">
            <h1 className="sr-only">חבילת צילום - פרטים</h1>
            {pkg.imageUrl && <img className="h-72 w-full object-cover" src={pkg.imageUrl} alt={pkg.name}/>}
            <div className="flex flex-col gap-3 p-6">
            <h2 className="text-3xl font-bold">{pkg.category.name + " " + pkg.name}</h2>
            <p>{pkg.description}</p>
            <p className="text-2xl font-bold text-rose-dark">{formatPrice(pkg.basePrice)}</p>
            <p className="text-sm text-muted">{formatDuration(pkg.durationMinutes)}</p>
            <ul className="list-inside list-disc space-y-1 rounded-xl bg-cream p-4">{pkg.includedItems.map(item=><li key={item}>{item}</li>)} </ul>
            <div className="mt-2 flex flex-wrap items-center gap-4">
            <Link className="btn" to={"/book/" + pkg.id}>להזמנת חבילה</Link>
            <Link className="text-sm text-rose-dark underline" to="/packages">חזרה לחבילות</Link>
            </div>
            </div>

        </div>
    )
}