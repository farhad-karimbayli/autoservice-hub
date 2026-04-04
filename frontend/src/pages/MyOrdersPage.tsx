import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type OrderItemResponse = {
    partId: number;
    partName: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
};

type OrderResponse = {
    id: number;
    createdAt: string;
    status: string;
    totalAmount: number;
    items: OrderItemResponse[];
};

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
        case "Paid":
            return "badge success";
        case "Cancelled":
            return "badge danger";
        case "Created":
            return "badge warning";
        default:
            return "badge";
    }
}

export function MyOrdersPage() {
    const [items, setItems] = useState<OrderResponse[]>([]);
    const [error, setError] = useState("");

    async function loadData() {
        setError("");

        try {
            const res = await api.get<OrderResponse[]>("/orders/my");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load orders"));
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    return (
        <div className="section-card">
            <h2>My orders</h2>
            <p className="meta">
                Review your purchased parts, order status and total amounts.
            </p>

            {error && <div className="message error">{error}</div>}

            {items.length === 0 ? (
                <p className="meta">You do not have any orders yet.</p>
            ) : (
                <ul className="list-reset list-stack">
                    {items.map((order) => (
                        <li key={order.id} className="list-item">
                            <div style={{ display: "grid", gap: 12 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                    }}
                                >
                                    <strong>Order #{order.id}</strong>
                                    <span className={getStatusClass(order.status)}>{order.status}</span>
                                </div>

                                <div className="meta">
                                    Created: {new Date(order.createdAt).toLocaleString()}
                                </div>

                                <div>
                                    <strong>Total:</strong> {order.totalAmount} AZN
                                </div>

                                <div className="section-card" style={{ padding: 16, background: "#f8fafc" }}>
                                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Items</h3>

                                    {order.items.length === 0 ? (
                                        <p className="meta">No items in this order.</p>
                                    ) : (
                                        <ul className="list-reset list-stack">
                                            {order.items.map((item) => (
                                                <li key={`${order.id}-${item.partId}`} className="list-item">
                                                    <div style={{ display: "grid", gap: 6 }}>
                                                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                                                            <strong>{item.partName}</strong>
                                                            <span className="badge">{item.lineTotal} AZN</span>
                                                        </div>

                                                        <div className="meta">
                                                            Quantity: {item.quantity}
                                                        </div>

                                                        <div className="meta">
                                                            Unit price: {item.unitPrice} AZN
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}