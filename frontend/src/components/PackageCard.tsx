import { Link } from "react-router-dom";
import type { Package } from "../types";
import { formatPrice, formatDuration } from "../utils/format";

type Props = { pkg: Package };
export default function PackageCard({ pkg }: Props) {

    return (
        <div className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
            {pkg.imageUrl ? <img className="h-48 w-full object-cover" src={pkg.imageUrl} alt={pkg.name}/> : <div className="h-48 bg-gradient-to-br from-sand to-rose/40" />}
            <div className="flex flex-1 flex-col gap-1 p-5">
            <span className="w-fit rounded-full bg-sand px-3 py-0.5 text-xs text-muted">{pkg.category.name}</span>
            <h3 className="text-xl font-bold">{pkg.name}</h3>
            <p className="text-lg font-bold text-rose-dark">{formatPrice(pkg.basePrice)}</p>
            <p className="mb-3 text-sm text-muted">{formatDuration(pkg.durationMinutes)}</p>
            <Link className="btn mt-auto w-fit" to={"/packages/" + pkg.id}>לפרטים</Link>
            </div>
        </div>
)
}