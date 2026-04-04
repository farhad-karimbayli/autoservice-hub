import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type UserItem = {
    id: string;
    email?: string | null;
    fullName?: string | null;
    phoneNumber?: string | null;
    role?: string | null;
};

const roles = ["Client", "Master", "Director", "Admin"];

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

function getRoleClass(role?: string | null) {
    switch (role) {
        case "Admin":
            return "badge danger";
        case "Director":
            return "badge warning";
        case "Master":
            return "badge success";
        case "Client":
            return "badge";
        default:
            return "badge";
    }
}

export function AdminUsersPage() {
    const [items, setItems] = useState<UserItem[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadUsers() {
        setError("");

        try {
            const res = await api.get<UserItem[]>("/admin/users");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load users"));
        }
    }

    useEffect(() => {
        loadUsers();
    }, []);

    async function assignRole(userId: string, role: string) {
        setError("");
        setSuccess("");

        try {
            await api.post("/admin/assign-role", { userId, role });
            setSuccess(`Role changed to ${role}`);
            await loadUsers();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to assign role"));
        }
    }

    return (
        <div className="section-card">
            <h2>Admin users</h2>
            <p className="meta">
                View all registered users and manage their current roles.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {items.length === 0 ? (
                <p className="meta">No users found.</p>
            ) : (
                <ul className="list-reset list-stack">
                    {items.map((item) => (
                        <li key={item.id} className="list-item">
                            <div style={{ display: "grid", gap: 10 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                    }}
                                >
                                    <strong>{item.fullName?.trim() ? item.fullName : item.email}</strong>
                                    <span className={getRoleClass(item.role)}>
                    {item.role ?? "No role"}
                  </span>
                                </div>

                                <div>
                                    <strong>Email:</strong> {item.email ?? "-"}
                                </div>

                                <div>
                                    <strong>Phone:</strong> {item.phoneNumber ?? "-"}
                                </div>

                                <div className="meta">
                                    User ID: {item.id}
                                </div>

                                <div className="inline-actions">
                                    {roles.map((role) => (
                                        <button
                                            key={role}
                                            type="button"
                                            className={role === "Admin" ? "danger" : undefined}
                                            onClick={() => assignRole(item.id, role)}
                                        >
                                            Set {role}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}