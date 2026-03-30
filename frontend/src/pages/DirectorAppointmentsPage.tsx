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

type MasterItem = {
    id: string;
    email: string;
    fullName?: string | null;
};

const statuses = ["Created", "Confirmed", "InProgress", "Done", "Cancelled"];

export function DirectorAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [masters, setMasters] = useState<MasterItem[]>([]);
    const [selectedMasters, setSelectedMasters] = useState<Record<number, string>>({});
    const [error, setError] = useState("");

    async function loadData() {
        setError("");

        try {
            const [appointmentsRes, mastersRes] = await Promise.all([
                api.get<AppointmentItem[]>("/appointments"),
                api.get<MasterItem[]>("/admin/masters"),
            ]);

            setItems(appointmentsRes.data);
            setMasters(mastersRes.data);
        } catch {
            setError("Failed to load director appointments");
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
            setError("Failed to update status");
        }
    }

    async function assignMaster(id: number) {
        const masterId = selectedMasters[id];

        if (!masterId) {
            setError("Select a master first");
            return;
        }

        setError("");

        try {
            await api.post(`/appointments/${id}/assign-master`, { masterId });
            await loadData();
        } catch {
            setError("Failed to assign master");
        }
    }

    return (
        <div>
            <h2>Director appointments</h2>

            {error && <p>{error}</p>}

            {items.length === 0 ? (
                <p>No appointments found</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id} style={{ marginBottom: 20 }}>
                            <div>
                                <strong>{item.serviceName}</strong>
                            </div>
                            <div>{new Date(item.date).toLocaleString()}</div>
                            <div>Status: {item.status}</div>
                            <div>ClientId: {item.clientId}</div>
                            <div>Master: {item.masterName ?? item.masterId ?? "Not assigned"}</div>
                            {item.comment && <div>Comment: {item.comment}</div>}

                            <div style={{ display: "grid", gap: 8, maxWidth: 420, marginTop: 8 }}>
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

                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
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
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}