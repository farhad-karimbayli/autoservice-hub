import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type UserItem = {
    id: string;
    email: string;
};

export function AdminUsersPage() {
    const [items, setItems] = useState<UserItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<UserItem[]>("/admin/users")
            .then((res) => setItems(res.data))
            .catch(() => setError("Failed to load users"));
    }, []);

    return (
        <div>
            <h2>Admin users</h2>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {item.email}
                    </li>
                ))}
            </ul>
        </div>
    );
}