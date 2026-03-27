import { Link, Outlet } from "react-router";
import { useAuth } from "../shared/auth/AuthContext";

export function Layout() {
    const { role, logout, token } = useAuth();

    return (
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24 }}>
            <header style={{ marginBottom: 24 }}>
                <h1>AutoService Hub</h1>

                <nav
                    style={{
                        display: "flex",
                        gap: 12,
                        flexWrap: "wrap",
                        marginBottom: 12,
                    }}
                >
                    <Link to="/">Home</Link>

                    {token && <Link to="/services">Services</Link>}

                    {role === "Client" && (
                        <>
                            <Link to="/appointments/create">Book service</Link>
                            <Link to="/appointments/my">My appointments</Link>
                            <Link to="/orders/create">Buy parts</Link>
                            <Link to="/orders/my">My orders</Link>
                        </>
                    )}

                    {(role === "Director" || role === "Admin" || role === "Master") && (
                        <>
                            <Link to="/inventory">Inventory</Link>
                        </>
                    )}

                    {role === "Master" && (
                        <>
                            <Link to="/parts-requests/my">My parts requests</Link>
                        </>
                    )}

                    {(role === "Director" || role === "Admin") && (
                        <>
                            <Link to="/parts-requests">Parts requests</Link>
                        </>
                    )}

                    {role === "Admin" && <Link to="/admin/users">Admin users</Link>}
                </nav>

                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span>Role: {role ?? "Guest"}</span>

                    {!token ? (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    ) : (
                        <button onClick={logout}>Logout</button>
                    )}
                </div>
            </header>

            <main>
                <Outlet />
            </main>
        </div>
    );
}