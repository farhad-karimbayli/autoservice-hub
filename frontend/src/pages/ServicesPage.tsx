import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

export function ServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<ServiceItem[]>("/services")
            .then((res) => setItems(res.data))
            .catch(() => setError("Failed to load services"));
    }, []);

    return (
        <div>
            <h2>Services</h2>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {item.name} — {item.price} AZN — {item.durationMinutes} min
                    </li>
                ))}
            </ul>
        </div>
    );
}