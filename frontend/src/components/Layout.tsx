import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../shared/auth/AuthContext";

export function Layout() {
    const { role, logout, token } = useAuth();

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
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
                    <Link to="/services">Services</Link>

                    {token && <Link to="/appointments/my">My appointments</Link>}
                    {token && <Link to="/orders/my">My orders</Link>}

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