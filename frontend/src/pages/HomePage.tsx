import { useAuth } from "../shared/auth/AuthContext";

export function HomePage() {
    const { fullName, role } = useAuth();

    return (
        <div className="section-card">
            <h2>Welcome, {fullName ?? "User"} 👋</h2>

            <p className="meta">
                You are logged in as <strong>{role}</strong>.
            </p>

            <div style={{ marginTop: 16 }}>
                <p>
                    This system allows you to:
                </p>

                <ul>
                    <li>Book and manage appointments</li>
                    <li>Manage services and masters</li>
                    <li>Track inventory and parts</li>
                    <li>Handle parts requests</li>
                </ul>
            </div>
        </div>
    );
}