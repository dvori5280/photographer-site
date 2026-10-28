import { Outlet, NavLink } from "react-router-dom";


export default function AdminLayout(){
    return(
        <div>
            <header className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="mb-3 text-2xl font-bold">אזור ניהול</h2>
                <nav className="flex flex-wrap gap-2 border-t border-sand pt-3">
                    <NavLink to="/admin/bookings" className={({ isActive }) => "rounded-xl px-4 py-1.5 text-sm no-underline transition " + (isActive ? "bg-rose text-white" : "text-muted hover:bg-sand")}>הזמנות</NavLink>
                    <NavLink to="/admin/messages" className={({ isActive }) => "rounded-xl px-4 py-1.5 text-sm no-underline transition " + (isActive ? "bg-rose text-white" : "text-muted hover:bg-sand")}>הודעות</NavLink>
                    <NavLink to="/admin/categories" className={({ isActive }) => "rounded-xl px-4 py-1.5 text-sm no-underline transition " + (isActive ? "bg-rose text-white" : "text-muted hover:bg-sand")}>קטגוריות</NavLink>
                    <NavLink to="/admin/gallery" className={({ isActive }) => "rounded-xl px-4 py-1.5 text-sm no-underline transition " + (isActive ? "bg-rose text-white" : "text-muted hover:bg-sand")}>גלריה</NavLink>
                    <NavLink to="/admin/packages" className={({ isActive }) => "rounded-xl px-4 py-1.5 text-sm no-underline transition " + (isActive ? "bg-rose text-white" : "text-muted hover:bg-sand")}>חבילות</NavLink>
                    </nav>
            </header>
            <main>
                <Outlet/>
            </main>
        </div>
    )
}