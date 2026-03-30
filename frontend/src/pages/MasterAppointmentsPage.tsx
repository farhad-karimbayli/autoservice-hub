import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type AppointmentItem = {
    id: number;
    serviceId: number;
    serviceName: string;
    date: string;
    status: string;
    comment?: string | null;
    clientId: string;
    masterId?: string | null;
    masterName?: string | null;
};

const statuses = ["Confirmed", "InProgress", "Done", "Cancelled"];

export function MasterAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [error, setError] = useState("");

    async function loadData() {
        setError("");

        try {
            const res = await api.get<AppointmentItem[]>("/appointments/master");
            setItems(res.data);
        } catch {
            setError("Failed to load master appointments");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function updateStatus(id: number, status: string) {
        setError("");

        try {
            await api.post(`/appointments/${id}/status`, { status });
            await loadData();
        } catch {
            setError("Failed to update appointment status");
        }
    }

    return (
        <div>
            <h2>Master appointments</h2>

            {error && <p>{error}</p>}

            {items.length === 0 ? (
                <p>No appointments assigned</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id} style={{ marginBottom: 16 }}>
                            <div>
                                <strong>{item.serviceName}</strong>
                            </div>
                            <div>{new Date(item.date).toLocaleString()}</div>
                            <div>Status: {item.status}</div>
                            {item.comment && <div>Comment: {item.comment}</div>}
                            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                                {statuses.map((status) => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => updateStatus(item.id, status)}
                                    >
                                        Set {status}
                                    </button>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}