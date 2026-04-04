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
        case "Done":
            return "badge success";
        case "Cancelled":
            return "badge danger";
        case "InProgress":
            return "badge warning";
        case "Confirmed":
            return "badge";
        default:
            return "badge";
    }
}

export function MasterAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");

        try {
            const res = await api.get<AppointmentItem[]>("/appointments/master");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load master appointments"));
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    async function updateStatus(id: number, status: string) {
        setError("");
        setSuccess("");

        try {
            await api.post(`/appointments/${id}/status`, { status });
            setSuccess(`Appointment #${id} updated to ${status}`);
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to update appointment status"));
        }
    }

    return (
        <div className="section-card">
            <h2>Master appointments</h2>
            <p className="meta">
                Review your assigned appointments and update their current status.
            </p>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {items.length === 0 ? (
                <p className="meta">No appointments assigned.</p>
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
                                    <strong>
                                        Appointment #{item.id} — {item.serviceName}
                                    </strong>
                                    <span className={getStatusClass(item.status)}>{item.status}</span>
                                </div>

                                <div>
                                    <strong>Date:</strong> {new Date(item.date).toLocaleString()}
                                </div>

                                <div>
                                    <strong>Client ID:</strong> {item.clientId}
                                </div>

                                {item.comment && (
                                    <div>
                                        <strong>Comment:</strong> {item.comment}
                                    </div>
                                )}

                                <div className="section-card" style={{ padding: 16, background: "#f8fafc" }}>
                                    <h3 style={{ marginTop: 0, marginBottom: 12 }}>Update status</h3>

                                    <div className="inline-actions">
                                        {statuses.map((status) => (
                                            <button
                                                key={status}
                                                type="button"
                                                className={status === "Cancelled" ? "danger" : undefined}
                                                onClick={() => updateStatus(item.id, status)}
                                            >
                                                Set {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}