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
        <div className="flex flex-col gap-12">
            <section className="-mx-5 -mt-8 bg-gradient-to-b from-sand to-cream px-5 py-16 text-center">
            <h1 className="text-5xl font-bold">מירי לבל</h1>
            <h3 className="mb-6 mt-2 text-xl text-muted">צילומים שנשארים לנצח</h3>
            <Link className="btn" to="/packages">לחבילות הצילום</Link>
            </section>
            <section>
            <h3 className="mb-6 text-center text-2xl font-bold">חבילות מומלצות</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packagesQuery.isLoading && <p className="text-center text-muted">טוען חבילות...</p>}
            {packagesQuery.isError && <p className="text-center text-red-700">{packagesQuery.error.message}</p>}
            {packagesQuery.data?.slice(0, 3).map(p=>
                <PackageCard key={p.id} pkg={p} />)}
            </div>
            </section>
            <section>
            <h3 className="mb-6 text-center text-2xl font-bold">מהגלריה</h3>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {photosQuery.isLoading && <p className="text-center text-muted">טוען תמונות...</p>}
            {photosQuery.isError && <p className="text-center text-red-700">{photosQuery.error.message}</p>}
            {photosQuery.data?.slice(0, 6).map(photo=>
                <PhotoCard key={photo.id} photo={photo} />)}
            </div>
            <div className="mt-6 text-center"><Link className="btn-outline" to="/gallery">לכל הגלריה</Link></div>
            </section>
            <section className="rounded-2xl bg-white p-8 text-center shadow-md">
            <Link className="btn" to="/contact">רוצה לשמוע עוד? צרי קשר</Link>
            </section>

        </div>
)
}