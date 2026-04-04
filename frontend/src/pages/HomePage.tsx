import { useAuth } from "../shared/auth/AuthContext";

export function HomePage() {
    const { fullName, role } = useAuth();

    return (
        <div className="grid-2">
            <section className="section-card">
                <h2>{fullName ? `Welcome, ${fullName}!` : "Welcome!"}</h2>
                <p className="meta">
                    AutoService Hub helps manage appointments, parts inventory, service catalog
                    and role-based workflows for clients, masters, directors and admins.
                </p>
                {role && <span className="badge">Current role: {role}</span>}
            </section>

            <section className="section-card">
                <h2>Quick overview</h2>
                <ul className="list-reset list-stack">
                    <li className="list-item">Clients can book services, reschedule and buy parts.</li>
                    <li className="list-item">Masters can manage their appointments and parts requests.</li>
                    <li className="list-item">Directors can manage services, parts, inventory and masters.</li>
                    <li className="list-item">Admins can manage users and roles.</li>
                </ul>
            </section>
        </div>
    );
}