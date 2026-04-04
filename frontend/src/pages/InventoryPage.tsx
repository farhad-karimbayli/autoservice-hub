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

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function InventoryPage() {
    const { role } = useAuth();

    const [items, setItems] = useState<InventoryItem[]>([]);
    const [parts, setParts] = useState<PartItem[]>([]);
    const [partId, setPartId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");

        try {
            const inventoryRes = await api.get<InventoryItem[]>("/inventory");
            setItems(inventoryRes.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load inventory"));
            return;
        }

        if (role === "Director" || role === "Admin") {
            try {
                const partsRes = await api.get<PartItem[]>("/parts");
                setParts(partsRes.data);
            } catch (error) {
                setError(getErrorMessage(error, "Failed to load parts"));
            }
        }
    }

    useEffect(() => {
        loadData();
    }, [role]);

    async function addInventory(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!partId) {
            setError("Select a part");
            return;
        }

        if (!quantity || Number(quantity) <= 0) {
            setError("Quantity must be greater than zero");
            return;
        }

        try {
            await api.post("/inventory/add", {
                partId: Number(partId),
                quantity: Number(quantity),
            });

            setSuccess("Inventory updated successfully");
            setPartId("");
            setQuantity("1");
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to add inventory"));
        }
    }

    return (
        <div className="section-card">
            <h2>Inventory</h2>
            <p className="meta">
                View current stock and, if allowed by your role, add new quantity to the warehouse.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {(role === "Director" || role === "Admin") && (
                <section className="section-card" style={{ marginBottom: 20 }}>
                    <h3 style={{ marginTop: 0 }}>Add inventory</h3>

                    <form onSubmit={addInventory} className="form-grid">
                        <select value={partId} onChange={(e) => setPartId(e.target.value)}>
                            <option value="">Select part</option>
                            {parts.map((part) => (
                                <option key={part.id} value={part.id}>
                                    {part.name} — {part.price} AZN
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
                </section>
            )}

            <section className="section-card">
                <h3 style={{ marginTop: 0 }}>Current stock</h3>

                {items.length === 0 ? (
                    <p className="meta">Inventory is empty.</p>
                ) : (
                    <ul className="list-reset list-stack">
                        {items.map((item) => (
                            <li key={item.partId} className="list-item">
                                <div style={{ display: "grid", gap: 8 }}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            gap: 12,
                                            flexWrap: "wrap",
                                        }}
                                    >
                                        <strong>{item.partName}</strong>
                                        <span className="badge">{item.quantity} in stock</span>
                                    </div>

                                    <div className="meta">Price: {item.partPrice} AZN</div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}