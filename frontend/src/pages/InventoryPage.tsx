import { useEffect, useState } from "react";
import { api } from "../shared/api/client";
import { useAuth } from "../shared/auth/AuthContext";

type InventoryItem = {
    partId: number;
    partName: string;
    partPrice: number;
    quantity: number;
};

type PartItem = {
    id: number;
    name: string;
    price: number;
};

export function InventoryPage() {
    const { role } = useAuth();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [parts, setParts] = useState<PartItem[]>([]);
    const [partId, setPartId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const [inventoryRes, partsRes] = await Promise.all([
                api.get<InventoryItem[]>("/inventory"),
                api.get<PartItem[]>("/parts"),
            ]);

            setItems(inventoryRes.data);
            setParts(partsRes.data);
        } catch {
            setError("Failed to load inventory");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function addInventory(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            await api.post("/inventory/add", {
                partId: Number(partId),
                quantity: Number(quantity),
            });

            setPartId("");
            setQuantity("1");
            await loadData();
        } catch {
            setError("Failed to add inventory");
        }
    }

    return (
        <div>
            <h2>Inventory</h2>

            {(role === "Director" || role === "Admin") && (
                <form
                    onSubmit={addInventory}
                    style={{ display: "grid", gap: 12, maxWidth: 420, marginBottom: 24 }}
                >
                    <select value={partId} onChange={(e) => setPartId(e.target.value)}>
                        <option value="">Select part</option>
                        {parts.map((part) => (
                            <option key={part.id} value={part.id}>
                                {part.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />

                    <button type="submit">Add to inventory</button>
                </form>
            )}

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.partId}>
                        {item.partName} — {item.partPrice} AZN — in stock: {item.quantity}
                    </li>
                ))}
            </ul>
        </div>
    );
}