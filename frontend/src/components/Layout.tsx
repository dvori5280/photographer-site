import {Outlet , Link, useNavigate  } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout()
{
    const { user, logout } = useAuth();
    const navigate = useNavigate();


    function handleLogout()
    {
        logout();
        navigate("/");
    }

    return(
        <div className="flex min-h-screen flex-col">
            <header className="sticky top-0 z-10 border-b border-sand bg-white/95 backdrop-blur">
                <nav className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-5 py-3">
                    <Link className="ml-4 font-serif text-xl font-bold text-rose-dark no-underline" to="/">מירי לבל</Link>
                    <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/">בית</Link>
                    <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/gallery">גלריה</Link>
                    <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/packages">חבילות צילום</Link>
                    <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/about">אודות</Link>
                    <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/contact">צור קשר</Link>
                    { user? 
                        (
                            <>
                                <span className="mr-auto" />
                                {user.role === "ADMIN" && <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand bg-sand" to="/admin/bookings">ניהול</Link>}
                                <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/my-bookings">ההזמנות שלי</Link>
                                <span className="px-2 text-sm text-muted">שלום {user.name}</span>
                                <button className="btn-outline !px-4 !py-1.5 text-sm" onClick={handleLogout}>התנתקות</button>
                            </>
                        ) :
                        (
                            <>
                                <span className="mr-auto" />
                                <Link className="rounded-full px-3 py-1.5 text-sm no-underline hover:bg-sand" to="/login">התחברות</Link>
                                <Link className="btn !px-4 !py-1.5 text-sm" to="/register">הרשמה</Link>
                            </>
                        )}
                </nav>
            </header>
            <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-8">
                <Outlet/>
            </main>
            <footer className="border-t border-sand py-6 text-center text-sm text-muted">כל הזכויות שמורות © דבורי נחמוני</footer>
        </div>
    )
}