import { useEffect, useState } from "react";
import { api } from "../shared/api/client";
import { getStatusClass } from "../shared/ui/status";

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

type MasterItem = {
    id: string;
    email: string;
    fullName?: string | null;
};

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

const statuses = ["Created", "Confirmed", "InProgress", "Done", "Cancelled"];

export function DirectorAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [masters, setMasters] = useState<MasterItem[]>([]);
    const [selectedMasters, setSelectedMasters] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadData() {
        setError("");

        try {
            const [appointmentsRes, mastersRes] = await Promise.all([
                api.get<AppointmentItem[]>("/appointments"),
                api.get<MasterItem[]>("/admin/masters"),
            ]);

            setItems(appointmentsRes.data);
            setMasters(mastersRes.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load director appointments"));
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
            setSuccess("Status updated successfully");
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to update status"));
        }
    }

    async function assignMaster(id: number) {
        const masterId = selectedMasters[id];

        if (!masterId) {
            setError("Select a master first");
            return;
        }

        setError("");
        setSuccess("");

        try {
            await api.post(`/appointments/${id}/assign-master`, {
                masterId,
            });

            setSuccess("Master assigned successfully");
            await loadData();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to assign master"));
        }
    }

    return (
        <div className="card-grid">
            <div>
                <h2>Director appointments</h2>
                <p className="card-subtitle">Manage all service appointments and assign masters.</p>
            </div>

            {error && <div className="message error">{error}</div>}
            {success && <div className="message success">{success}</div>}

            {items.length === 0 ? (
                <div className="section-card">
                    <p>No appointments found.</p>
                </div>
            ) : (
                <ul className="list-reset list-stack">
                    {items.map((item) => (
                        <li key={item.id} className="list-item">
                            <div className="entity-row">
                                <div className="entity-main">
                                    <strong>{item.serviceName}</strong>
                                    <div className="meta">{new Date(item.date).toLocaleString()}</div>
                                    <div>Client ID: {item.clientId}</div>
                                    <div>Master: {item.masterName ?? "Not assigned"}</div>
                                    {item.comment && <div>Comment: {item.comment}</div>}
                                </div>

                                <div className="entity-side">
                                    <span className={getStatusClass(item.status)}>{item.status}</span>
                                </div>
                            </div>

                            <div className="split-grid" style={{ marginTop: 16 }}>
                                <div className="section-card">
                                    <h3 className="card-title">Assign master</h3>
                                    <div className="form-grid">
                                        <select
                                            value={selectedMasters[item.id] ?? ""}
                                            onChange={(e) =>
                                                setSelectedMasters((prev) => ({
                                                    ...prev,
                                                    [item.id]: e.target.value,
                                                }))
                                            }
                                        >
                                            <option value="">Select master</option>
                                            {masters.map((master) => (
                                                <option key={master.id} value={master.id}>
                                                    {master.fullName ? `${master.fullName} (${master.email})` : master.email}
                                                </option>
                                            ))}
                                        </select>

                                        <button type="button" onClick={() => assignMaster(item.id)}>
                                            Assign master
                                        </button>
                                    </div>
                                </div>

                                <div className="section-card">
                                    <h3 className="card-title">Change status</h3>
                                    <div className="inline-actions">
                                        {statuses.map((status) => (
                                            <button
                                                key={status}
                                                className="secondary"
                                                type="button"
                                                onClick={() => updateStatus(item.id, status)}
                                            >
                                                {status}
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