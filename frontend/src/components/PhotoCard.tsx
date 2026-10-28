import type { Photo } from "../types";
import { formatDate } from "../utils/format";


type Props = { photo: Photo };

export default function PhotoCard({ photo }: Props) {
 
    return(
        <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
            <img className="h-56 w-full object-cover" src={photo.imageUrl} alt={photo.title} />
            <div className="p-4">
            <h3 className="text-lg font-bold">{photo.title}</h3>
            {photo.takenAt && <p className="text-xs text-muted">{formatDate(photo.takenAt)}</p>}
            {photo.description && <p className="mt-1 text-sm">{photo.description}</p>}
            </div>
            

        </div>
    )
}