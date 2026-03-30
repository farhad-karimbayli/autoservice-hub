import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

export function ManageServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const res = await api.get<ServiceItem[]>("/services");
            setItems(res.data);
        } catch {
            setError("Failed to load services");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function createService(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            await api.post("/services", {
                name,
                price: Number(price),
                durationMinutes: Number(durationMinutes),
            });

            setName("");
            setPrice("");
            setDurationMinutes("");
            await loadData();
        } catch {
            setError("Failed to create service");
        }
    }

    return (
        <div>
            <h2>Manage services</h2>

            <form onSubmit={createService} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
                <input
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    placeholder="Duration minutes"
                />
                <button type="submit">Create service</button>
            </form>

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