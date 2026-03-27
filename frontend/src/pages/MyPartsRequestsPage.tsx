import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type PartsRequestItem = {
    id: number;
    partName: string;
    quantity: number;
    comment?: string | null;
    status: string;
    createdAt: string;
};

type PartItem = {
    id: number;
    name: string;
    price: number;
};

export function MyPartsRequestsPage() {
    const [items, setItems] = useState<PartsRequestItem[]>([]);
    const [parts, setParts] = useState<PartItem[]>([]);
    const [partId, setPartId] = useState("");
    const [quantity, setQuantity] = useState("1");
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const [requestsRes, partsRes] = await Promise.all([
                api.get<PartsRequestItem[]>("/parts-requests/my"),
                api.get<PartItem[]>("/parts"),
            ]);

            setItems(requestsRes.data);
            setParts(partsRes.data);
        } catch {
            setError("Failed to load parts requests");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function createRequest(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        try {
            await api.post("/parts-requests", {
                partId: Number(partId),
                quantity: Number(quantity),
                comment,
            });

            setPartId("");
            setQuantity("1");
            setComment("");
            await loadData();
        } catch {
            setError("Failed to create parts request");
        }
    }

    return (
        <div>
            <h2>My parts requests</h2>

            <form
                onSubmit={createRequest}
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

                <textarea
                    rows={4}
                    placeholder="Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <button type="submit">Create request</button>
            </form>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id}>
                        {item.partName} — qty: {item.quantity} — {item.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}