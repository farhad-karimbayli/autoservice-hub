import { useEffect, useState } from "react";
import { api } from "../shared/api/client";
import { getStatusClass } from "../shared/ui/status";

type UserItem = {
    id: string;
    email?: string | null;
    fullName?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
};

const roles = ["Client", "Master", "Director", "Admin"];

export function AdminUsersPage() {
    const [items, setItems] = useState<UserItem[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadUsers() {
        try {
            const res = await api.get<UserItem[]>("/admin/users");
            setItems(res.data);
        } catch {
            setError("Failed to load users");
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function assignRole(userId: string, role: string) {
        try {
            await api.post("/admin/assign-role", { userId, role });
            setSuccess("Role updated successfully");
            await loadUsers();
        } catch {
            setError("Failed to assign role");
        }
    }

    return (
        <div className="card-grid">
            <div>
                <h2>Admin users</h2>
                <p className="card-subtitle">Manage user roles and review registered accounts.</p>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            <ul className="list-reset list-stack">
                {items.map((item) => (
                    <li key={item.id} className="list-item">
                        <div className="entity-row">
                            <div className="entity-main">
                                <strong>{item.fullName?.trim() ? item.fullName : item.email}</strong>
                                <div>Email: {item.email ?? "-"}</div>
                                <div>Phone: {item.phoneNumber ?? "-"}</div>
                            </div>

                            <div className="entity-side">
                <span className={getStatusClass(item.role ?? "No role")}>
                  {item.role ?? "No role"}
                </span>
                            </div>
                        </div>

                        <div className="inline-actions">
                            {roles.map((role) => (
                                <button
                                    key={role}
                                    className="secondary"
                                    type="button"
                                    onClick={() => assignRole(item.id, role)}
                                >
                                    Set {role}
                                </button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}