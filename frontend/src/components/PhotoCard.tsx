import type { Photo } from "../types";
import { formatDate } from "../utils/format";


type Props = { photo: Photo };

export default function PhotoCard({ photo }: Props) {
 
    return(
        <div>
            <img src={photo.imageUrl} alt={photo.title} />
            <h3>{photo.title}</h3>
            {photo.takenAt && <p>{formatDate(photo.takenAt)}</p>}
            {photo.description && <p>{photo.description}</p>}
            

        </div>
    )
}