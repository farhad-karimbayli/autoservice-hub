import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function ServicesPage() {
    const [items, setItems] = useState<ServiceItem[]>([]);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get<ServiceItem[]>("/services")
            .then((res) => setItems(res.data))
            .catch((error) => setError(getErrorMessage(error, "Failed to load services")));
    }, []);

    return (
        <div className="section-card">
            <h2>Services</h2>
            <p className="meta">
                Browse all available services, prices and estimated duration.
            </p>

            {error && <div className="message error">{error}</div>}

            {items.length === 0 ? (
                <p className="meta">No services available right now.</p>
            ) : (
                <ul className="list-reset list-stack">
                    {items.map((item) => (
                        <li key={item.id} className="list-item">
                            <div style={{ display: "grid", gap: 10 }}>
                                <div
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        gap: 12,
                                        flexWrap: "wrap",
                                        alignItems: "center",
                                    }}
                                >
                                    <strong>{item.name}</strong>
                                    <span className="badge">{item.durationMinutes} min</span>
                                </div>

                                <div className="meta">Price: {item.price} AZN</div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}