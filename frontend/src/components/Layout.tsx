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
        <div>
            <header>
                <nav>
                    <Link to="/">בית</Link>
                    <Link to="/gallery">גלריה</Link>
                    <Link to="/packages">חבילות צילום</Link>
                    <Link to="/about">אודות</Link>
                    <Link to="/contact">צור קשר</Link>
                    { user? 
                        (
                            <>
                                {user.role === "ADMIN" && <Link to="/admin/bookings">ניהול</Link>}
                                <Link to="/my-bookings">ההזמנות שלי</Link>
                                <span>שלום {user.name}</span>
                                <button onClick={handleLogout}>התנתקות</button>
                            </>
                        ) :
                        (
                            <>
                                <Link to="/login">התחברות</Link>
                                <Link to="/register">הרשמה</Link>
                            </>
                        )}
                </nav>
            </header>
            <main>
                <Outlet/>
            </main>
            <footer>כל הזכויות שמורות</footer>
        </div>
    )
}