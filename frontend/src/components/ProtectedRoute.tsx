import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


type Props = { adminOnly?: boolean };


export default function ProtectedRoute({ adminOnly }: Props)
{
    const { user, isLoading } = useAuth();

    if(isLoading) return <p>טוען...</p>
    if(!user) return <Navigate to="/login" replace />
    if(adminOnly && user.role !== "ADMIN") return <Navigate to="/" replace />

    return(
        <Outlet />
    )
}