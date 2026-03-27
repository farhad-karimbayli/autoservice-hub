import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type PartsRequestItem = {
    id: number;
    masterId: string;
    partName: string;
    quantity: number;
    comment?: string | null;
    status: string;
    createdAt: string;
};

const statuses = ["Created", "Approved", "Rejected", "Ordered", "Received"];

export function AllPartsRequestsPage() {
    const [items, setItems] = useState<PartsRequestItem[]>([]);
    const [error, setError] = useState("");

    async function loadData() {
        try {
            const res = await api.get<PartsRequestItem[]>("/parts-requests");
            setItems(res.data);
        } catch {
            setError("Failed to load parts requests");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function updateStatus(id: number, status: string) {
        try {
            await api.post(`/parts-requests/${id}/status`, { status });
            await loadData();
        } catch {
            setError("Failed to update status");
        }
    }

    return (
        <div>
            <h2>All parts requests</h2>

            {error && <p>{error}</p>}

            <ul>
                {items.map((item) => (
                    <li key={item.id} style={{ marginBottom: 12 }}>
                        <div>
                            #{item.id} — {item.partName} — qty: {item.quantity} — {item.status}
                        </div>

                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                            {statuses.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => updateStatus(item.id, status)}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}