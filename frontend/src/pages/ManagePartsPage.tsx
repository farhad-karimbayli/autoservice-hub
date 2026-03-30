import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type PartItem = {
    id: number;
    name: string;
    price: number;
};

export function ManagePartsPage() {
    const [items, setItems] = useState<PartItem[]>([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const res = await api.get<PartItem[]>("/parts");
            setItems(res.data);
        } catch {
            setError("Failed to load parts");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function createPart(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            await api.post("/parts", {
                name,
                price: Number(price),
            });

            setName("");
            setPrice("");
            await loadData();
        } catch {
            setError("Failed to create part");
        }
    }

    return (
        <div>
            <h2>Manage parts</h2>

            <form onSubmit={createPart} style={{ display: "grid", gap: 12, maxWidth: 420 }}>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Part name" />
                <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price" />
                <button type="submit">Create part</button>
            </form>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {item.name} — {item.price} AZN
                    </li>
                ))}
            </ul>
        </div>
    );
}