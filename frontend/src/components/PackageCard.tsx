import { Link } from "react-router-dom";
import type { Package } from "../types";
import { formatPrice, formatDuration } from "../utils/format";

type Props = { pkg: Package };
export default function PackageCard({ pkg }: Props) {

    return (
        <div>
            {pkg.imageUrl && <img src={pkg.imageUrl} alt={pkg.name}/>}
            <h3>{pkg.name}</h3>
            <h4>{pkg.category.name}</h4>
            <p>{formatPrice(pkg.basePrice)}</p>
            <p>{formatDuration(pkg.durationMinutes)}</p>
            <Link to={"/packages/" + pkg.id}>לפרטים</Link>
        </div>
)
}