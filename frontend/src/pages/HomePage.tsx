import { Link } from "react-router-dom";
import { usePackages } from "../hooks/usePackages";
import { usePhotos } from "../hooks/usePhotos";
import PackageCard from "../components/PackageCard";
import PhotoCard from "../components/PhotoCard";


export default function HomePage()
{

    const packagesQuery = usePackages(undefined, "price_asc");
    const photosQuery = usePhotos();

    return (
        <div>
            <h1>מירי לבל</h1>
            <h3>צילומים שנשארים לנצח</h3>
            <Link to="/packages">לחבילות הצילום</Link>
            <h3>חבילות מומלצות</h3>
            {packagesQuery.isLoading && <p>טוען חבילות...</p>}
            {packagesQuery.isError && <p>{packagesQuery.error.message}</p>}
            {packagesQuery.data?.slice(0, 3).map(p=>
                <PackageCard key={p.id} pkg={p} />)}
            <h3>מהגלריה</h3>
            {photosQuery.isLoading && <p>טוען תמונות...</p>}
            {photosQuery.isError && <p>{photosQuery.error.message}</p>}
            {photosQuery.data?.slice(0, 6).map(photo=>
                <PhotoCard key={photo.id} photo={photo} />)}
            <Link to="/gallery">לכל הגלריה</Link>
            <Link to="/contact">רוצה לשמוע עוד? צרי קשר</Link>

        </div>
)
}