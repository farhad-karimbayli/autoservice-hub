import { useEffect, useState } from "react";
import { api } from "../shared/api/client";

type AppointmentItem = {
    id: number;
    serviceName: string;
    date: string;
    status: string;
    masterName?: string | null;
    comment?: string | null;
};

export function MyAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");
        try {
            const res = await api.get<AppointmentItem[]>("/appointments/my");
            setItems(res.data);
        } catch {
            setError("Failed to load appointments");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function cancelAppointment(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.post(`/appointments/${id}/cancel`);
            setSuccess("Appointment cancelled");
            await loadData();
        } catch {
            setError("Failed to cancel appointment");
        }
    }

    return (
        <div className="section-card">
            <h2>My appointments</h2>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {items.length === 0 ? (
                <p className="meta">No appointments yet.</p>
            ) : (
                <ul className="list-reset list-stack">
                    {items.map((item) => (
                        <li key={item.id} className="list-item">
                            <div style={{ display: "grid", gap: 8 }}>
                                <strong>{item.serviceName}</strong>

                                <div className="meta">
                                    {new Date(item.date).toLocaleString()}
                                </div>

                                <div>
                                    Master: {item.masterName ?? "Not assigned"}
                                </div>

                                <div>Status: {item.status}</div>

                                {item.comment && (
                                    <div>Comment: {item.comment}</div>
                                )}

                                {item.status !== "Cancelled" && (
                                    <div className="inline-actions">
                                        <button
                                            className="danger"
                                            onClick={() => cancelAppointment(item.id)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}