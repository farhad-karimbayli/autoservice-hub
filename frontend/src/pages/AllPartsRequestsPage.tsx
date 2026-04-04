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

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

function getStatusClass(status: string) {
    switch (status) {
        case "Approved":
        case "Received":
            return "badge success";
        case "Rejected":
            return "badge danger";
        case "Ordered":
            return "badge warning";
        default:
            return "badge";
    }
}

export function AllPartsRequestsPage() {
    const [items, setItems] = useState<PartsRequestItem[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");

        try {
            const res = await api.get<PartsRequestItem[]>("/parts-requests");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load parts requests"));
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function updateStatus(id: number, status: string) {
        setError("");
        setSuccess("");

        try {
            await api.post(`/parts-requests/${id}/status`, { status });
            setSuccess(`Request #${id} updated to ${status}`);
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to update status"));
        }
    }

    return (
        <div className="section-card">
            <h2>All parts requests</h2>
            <p className="meta">
                Review requests created by masters and update their status.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {items.length === 0 ? (
                <p className="meta">No parts requests found.</p>
            ) : (
                <ul className="list-reset list-stack">
                    {items.map((item) => (
                        <li key={item.id} className="list-item">
                            <div style={{ display: "grid", gap: 8 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <strong>Request #{item.id}</strong>
                                    <span className={getStatusClass(item.status)}>{item.status}</span>
                                </div>

                                <div>
                                    <strong>Part:</strong> {item.partName}
                                </div>

                                <div>
                                    <strong>Quantity:</strong> {item.quantity}
                                </div>

                                <div>
                                    <strong>Master ID:</strong> {item.masterId}
                                </div>

                                <div className="meta">
                                    Created: {new Date(item.createdAt).toLocaleString()}
                                </div>

                                {item.comment && (
                                    <div>
                                        <strong>Comment:</strong> {item.comment}
                                    </div>
                                )}

                                <div className="inline-actions">
                                    {statuses.map((status) => (
                                        <button
                                            key={status}
                                            type="button"
                                            className={status === "Rejected" ? "danger" : undefined}
                                            onClick={() => updateStatus(item.id, status)}
                                        >
                                            Set {status}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}