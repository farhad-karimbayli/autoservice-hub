import { Link, Outlet } from "react-router";
import { useAuth } from "../shared/auth/AuthContext";

export function Layout() {
    const { role, fullName, logout, token } = useAuth();

    return (
        <div className="app-shell">
            <header className="topbar">
                <div className="brand-row">
                    <div className="brand-block">
                        <h1>AutoService Hub</h1>
                        <p>Appointments, inventory, parts and service management</p>
                    </div>

                    <div className="user-chip">
                        {token
                            ? `${fullName ?? "User"} (${role ?? "Unknown"})`
                            : "Guest mode"}
                    </div>
                </div>

                <nav className="nav-grid">
                    <Link className="nav-link" to="/">Home</Link>

                    {token && <Link className="nav-link" to="/services">Services</Link>}

                    {role === "Client" && (
                        <>
                            <Link className="nav-link" to="/appointments/create">Book service</Link>
                            <Link className="nav-link" to="/appointments/my">My appointments</Link>
                            <Link className="nav-link" to="/orders/create">Buy parts</Link>
                            <Link className="nav-link" to="/orders/my">My orders</Link>
                        </>
                    )}

                    {role === "Master" && (
                        <>
                            <Link className="nav-link" to="/inventory">Inventory</Link>
                            <Link className="nav-link" to="/master/appointments">Master appointments</Link>
                            <Link className="nav-link" to="/parts-requests/my">My parts requests</Link>
                        </>
                    )}

                    {(role === "Director" || role === "Admin") && (
                        <>
                            <Link className="nav-link" to="/director/appointments">Director appointments</Link>
                            <Link className="nav-link" to="/manage/services">Manage services</Link>
                            <Link className="nav-link" to="/manage/parts">Manage parts</Link>
                            <Link className="nav-link" to="/manage/masters">Manage masters</Link>
                            <Link className="nav-link" to="/inventory">Inventory</Link>
                            <Link className="nav-link" to="/parts-requests">Parts requests</Link>
                        </>
                    )}

                    {role === "Admin" && (
                        <Link className="nav-link" to="/admin/users">Admin users</Link>
                    )}
                </nav>

                <div className="actions-row">
                    <div className="status-text">
                        {token ? "You are signed in and ready to work." : "Please login or register."}
                    </div>

                    {!token ? (
                        <div className="inline-actions">
                            <Link className="nav-link" to="/login">Login</Link>
                            <Link className="nav-link" to="/register">Register</Link>
                        </div>
                    ) : (
                        <button className="secondary" onClick={logout}>Logout</button>
                    )}
                </div>
            </header>

            <main className="page-card">
                <Outlet />
            </main>
        </div>
    );
}