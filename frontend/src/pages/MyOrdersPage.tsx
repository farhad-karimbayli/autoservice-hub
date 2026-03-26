import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type OrderItem = {
    id: number;
    createdAt: string;
    status: string;
    totalAmount: number;
};

export function MyOrdersPage() {
    const [items, setItems] = useState<OrderItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<OrderItem[]>("/orders/my")
            .then((res) => setItems(res.data))
            .catch(() => setError("Failed to load orders"));
    }, []);

    return (
        <div>
            <h2>My orders</h2>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        Order #{item.id} — {item.totalAmount} AZN — {item.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}