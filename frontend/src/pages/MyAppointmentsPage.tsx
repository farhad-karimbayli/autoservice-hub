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

type AvailableMaster = {
    masterId: string;
    fullName: string;
};

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function MyAppointmentsPage() {
    const [items, setItems] = useState<AppointmentItem[]>([]);
    const [availableMasters, setAvailableMasters] = useState<Record<number, AvailableMaster[]>>({});
    const [newDates, setNewDates] = useState<Record<number, string>>({});
    const [newMasters, setNewMasters] = useState<Record<number, string>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadAppointments() {
        setError("");
        try {
            const res = await api.get<AppointmentItem[]>("/appointments/my");
            setItems(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load appointments"));
        }
    }

    useEffect(() => {
        loadAppointments();
    }, []);

    async function cancelAppointment(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.post(`/appointments/${id}/cancel`);
            setSuccess("Appointment cancelled successfully");
            await loadAppointments();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to cancel appointment"));
        }
    }

    async function loadMastersForReschedule(appointment: AppointmentItem) {
        const date = newDates[appointment.id];

        if (!date) {
            setError("Choose new date first");
            return;
        }

        setError("");

        try {
            const res = await api.get<AvailableMaster[]>("/appointments/available-masters", {
                params: {
                    serviceId: appointment.serviceId,
                    date,
                },
            });

            setAvailableMasters((prev) => ({
                ...prev,
                [appointment.id]: res.data,
            }));
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load available masters"));
        }
    }

    async function rescheduleAppointment(id: number) {
        const masterId = newMasters[id];
        const date = newDates[id];

        if (!date) {
            setError("Choose new date first");
            return;
        }

        if (!masterId) {
            setError("Choose a master first");
            return;
        }

        setError("");
        setSuccess("");

        try {
            await api.post(`/appointments/${id}/reschedule`, {
                masterId,
                date,
            });

            setSuccess("Appointment rescheduled successfully");
            await loadAppointments();
        } catch (error) {
            setError(getErrorMessage(error, "Failed to reschedule appointment"));
        }
    }

    return (
        <div className="card-grid">
            <div>
                <h2>My appointments</h2>
                <p className="card-subtitle">View, cancel or reschedule your bookings.</p>
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
                                    <div>Master: {item.masterName ?? "Not assigned"}</div>
                                    {item.comment && <div>Comment: {item.comment}</div>}
                                </div>

                                <div className="entity-side">
                                    <span className={getStatusClass(item.status)}>{item.status}</span>
                                </div>
                            </div>

                            {item.status !== "Cancelled" && item.status !== "Done" && (
                                <div className="split-grid" style={{ marginTop: 16 }}>
                                    <div className="section-card">
                                        <h3 className="card-title">Cancel</h3>
                                        <p className="card-subtitle">Cancel this appointment if your plans changed.</p>
                                        <button className="danger" type="button" onClick={() => cancelAppointment(item.id)}>
                                            Cancel appointment
                                        </button>
                                    </div>

                                    <div className="section-card">
                                        <h3 className="card-title">Reschedule</h3>
                                        <div className="form-grid">
                                            <input
                                                type="datetime-local"
                                                value={newDates[item.id] ?? ""}
                                                onChange={(e) =>
                                                    setNewDates((prev) => ({
                                                        ...prev,
                                                        [item.id]: e.target.value,
                                                    }))
                                                }
                                            />

                                            <button
                                                className="secondary"
                                                type="button"
                                                onClick={() => loadMastersForReschedule(item)}
                                            >
                                                Load available masters
                                            </button>

                                            <select
                                                value={newMasters[item.id] ?? ""}
                                                onChange={(e) =>
                                                    setNewMasters((prev) => ({
                                                        ...prev,
                                                        [item.id]: e.target.value,
                                                    }))
                                                }
                                            >
                                                <option value="">Select master</option>
                                                {(availableMasters[item.id] ?? []).map((master) => (
                                                    <option key={master.masterId} value={master.masterId}>
                                                        {master.fullName}
                                                    </option>
                                                ))}
                                            </select>

                                            <button type="button" onClick={() => rescheduleAppointment(item.id)}>
                                                Reschedule appointment
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}