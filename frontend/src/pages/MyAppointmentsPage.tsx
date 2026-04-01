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
        setSuccess("");

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
        <div>
            <h2>My appointments</h2>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            {items.length === 0 ? (
                <p>No appointments found</p>
            ) : (
                <ul>
                    {items.map((item) => (
                        <li key={item.id} style={{ marginBottom: 20 }}>
                            <div>
                                <strong>{item.serviceName}</strong>
                            </div>
                            <div>Date: {new Date(item.date).toLocaleString()}</div>
                            <div>Status: {item.status}</div>
                            <div>Master: {item.masterName ?? item.masterId ?? "Not assigned"}</div>
                            {item.comment && <div>Comment: {item.comment}</div>}

                            {item.status !== "Cancelled" && item.status !== "Done" && (
                                <div style={{ display: "grid", gap: 8, maxWidth: 420, marginTop: 10 }}>
                                    <button type="button" onClick={() => cancelAppointment(item.id)}>
                                        Cancel appointment
                                    </button>

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

                                    <button type="button" onClick={() => loadMastersForReschedule(item)}>
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
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}