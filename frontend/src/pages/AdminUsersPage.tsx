import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type UserItem = {
    id: string;
    email: string;
};

const roles = ["Client", "Master", "Director", "Admin"];

export function AdminUsersPage() {
    const [items, setItems] = useState<UserItem[]>([]);
    const [error, setError] = useState("");

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
            alert(`Role ${role} assigned`);
        } catch {
            setError("Failed to assign role");
        }
    }

    return (
        <div>
            <h2>Admin users</h2>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id} style={{ marginBottom: 12 }}>
                        <div>{item.email}</div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                            {roles.map((role) => (
                                <button
                                    key={role}
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