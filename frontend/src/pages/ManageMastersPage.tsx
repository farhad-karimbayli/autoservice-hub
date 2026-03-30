import { useEffect, useMemo, useState } from "react";
import { api } from "../shared/api/client";

type UserItem = {
    id: string;
    email: string;
    fullName?: string | null;
    phoneNumber?: string | null;
};

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
};

type MasterServiceItem = {
    serviceId: number;
    name: string;
};

type WorkingHourItem = {
    id: number;
    masterId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
};

const days = [
    { value: 1, label: "Monday" },
    { value: 2, label: "Tuesday" },
    { value: 3, label: "Wednesday" },
    { value: 4, label: "Thursday" },
    { value: 5, label: "Friday" },
    { value: 6, label: "Saturday" },
    { value: 7, label: "Sunday" },
];

function getErrorMessage(error: any, fallback: string) {
    return (
        error?.response?.data?.message ||
        error?.response?.data ||
        error?.message ||
        fallback
    );
}

export function ManageMastersPage() {
    const [users, setUsers] = useState<UserItem[]>([]);
    const [services, setServices] = useState<ServiceItem[]>([]);
    const [selectedMasterId, setSelectedMasterId] = useState("");
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [masterServices, setMasterServices] = useState<MasterServiceItem[]>([]);
    const [workingHours, setWorkingHours] = useState<WorkingHourItem[]>([]);

    const [dayOfWeek, setDayOfWeek] = useState("1");
    const [startTime, setStartTime] = useState("09:00:00");
    const [endTime, setEndTime] = useState("18:00:00");
    const [editingWorkingHourId, setEditingWorkingHourId] = useState<number | null>(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadInitialData() {
        setError("");
        setSuccess("");

        try {
            const mastersRes = await api.get<UserItem[]>("/admin/masters");
            setUsers(mastersRes.data);
        } catch (error) {
            setError(`Failed to load masters: ${getErrorMessage(error, "unknown error")}`);
            return;
        }

        try {
            const servicesRes = await api.get<ServiceItem[]>("/services");
            setServices(servicesRes.data);
        } catch (error) {
            setError(`Failed to load services: ${getErrorMessage(error, "unknown error")}`);
        }
    }

    useEffect(() => {
        loadInitialData();
    }, []);

    async function loadMasterData(masterId: string) {
        if (!masterId) {
            setMasterServices([]);
            setWorkingHours([]);
            setSelectedServiceIds([]);
            return;
        }

        setError("");

        try {
            const servicesRes = await api.get<MasterServiceItem[]>(
                `/admin/masters/${masterId}/services`
            );

            const hoursRes = await api.get<WorkingHourItem[]>(
                `/admin/masters/${masterId}/working-hours`
            );

            setMasterServices(servicesRes.data);
            setWorkingHours(hoursRes.data);
            setSelectedServiceIds(servicesRes.data.map((x) => x.serviceId));
        } catch (error) {
            setError(`Failed to load master data: ${getErrorMessage(error, "unknown error")}`);
        }
    }

    useEffect(() => {
        loadMasterData(selectedMasterId);
    }, [selectedMasterId]);

    async function assignServices() {
        if (!selectedMasterId) {
            setError("Select a master first");
            return;
        }

        setError("");
        setSuccess("");

        try {
            await api.post(`/admin/masters/${selectedMasterId}/services`, {
                serviceIds: selectedServiceIds,
            });

            setSuccess("Services assigned successfully");
            await loadMasterData(selectedMasterId);
        } catch (error) {
            setError(`Failed to assign services: ${getErrorMessage(error, "unknown error")}`);
        }
    }

    function resetWorkingHoursForm() {
        setEditingWorkingHourId(null);
        setDayOfWeek("1");
        setStartTime("09:00:00");
        setEndTime("18:00:00");
    }

    function startEditWorkingHour(item: WorkingHourItem) {
        setEditingWorkingHourId(item.id);
        setDayOfWeek(String(item.dayOfWeek));
        setStartTime(item.startTime);
        setEndTime(item.endTime);
        setError("");
        setSuccess("");
    }

    async function saveWorkingHours(e: React.FormEvent) {
        e.preventDefault();

        if (!selectedMasterId) {
            setError("Select a master first");
            return;
        }

        setError("");
        setSuccess("");

        try {
            if (editingWorkingHourId === null) {
                await api.post(`/admin/masters/${selectedMasterId}/working-hours`, {
                    dayOfWeek: Number(dayOfWeek),
                    startTime,
                    endTime,
                });
                setSuccess("Working hours added successfully");
            } else {
                await api.put(`/admin/masters/working-hours/${editingWorkingHourId}`, {
                    dayOfWeek: Number(dayOfWeek),
                    startTime,
                    endTime,
                });
                setSuccess("Working hours updated successfully");
            }

            resetWorkingHoursForm();
            await loadMasterData(selectedMasterId);
        } catch (error) {
            setError(`Failed to save working hours: ${getErrorMessage(error, "unknown error")}`);
        }
    }

    async function deleteWorkingHour(id: number) {
        setError("");
        setSuccess("");

        try {
            await api.delete(`/admin/masters/working-hours/${id}`);

            if (editingWorkingHourId === id) {
                resetWorkingHoursForm();
            }

            setSuccess("Working hour deleted successfully");
            await loadMasterData(selectedMasterId);
        } catch (error) {
            setError(`Failed to delete working hour: ${getErrorMessage(error, "unknown error")}`);
        }
    }

    const selectedMaster = useMemo(
        () => users.find((x) => x.id === selectedMasterId),
        [users, selectedMasterId]
    );

    function toggleService(serviceId: number) {
        setSelectedServiceIds((prev) =>
            prev.includes(serviceId)
                ? prev.filter((x) => x !== serviceId)
                : [...prev, serviceId]
        );
    }

    return (
        <div>
            <h2>Manage masters</h2>

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}

            <div style={{ display: "grid", gap: 24 }}>
                <section>
                    <h3>Select master</h3>

                    <select
                        value={selectedMasterId}
                        onChange={(e) => {
                            setSuccess("");
                            setSelectedMasterId(e.target.value);
                            resetWorkingHoursForm();
                        }}
                    >
                        <option value="">Select master</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.fullName ? `${user.fullName} (${user.email})` : user.email}
                            </option>
                        ))}
                    </select>

                    {selectedMaster && (
                        <div style={{ marginTop: 8 }}>
                            <div><strong>Name:</strong> {selectedMaster.fullName ?? "-"}</div>
                            <div><strong>Email:</strong> {selectedMaster.email}</div>
                            <div><strong>Phone:</strong> {selectedMaster.phoneNumber ?? "-"}</div>
                        </div>
                    )}
                </section>

                <section>
                    <h3>Assign services</h3>

                    <div style={{ display: "grid", gap: 8 }}>
                        {services.map((service) => (
                            <label key={service.id} style={{ display: "flex", gap: 8 }}>
                                <input
                                    type="checkbox"
                                    checked={selectedServiceIds.includes(service.id)}
                                    onChange={() => toggleService(service.id)}
                                />
                                <span>
                  {service.name} — {service.price} AZN — {service.durationMinutes} min
                </span>
                            </label>
                        ))}
                    </div>

                    <div style={{ marginTop: 12 }}>
                        <button type="button" onClick={assignServices}>
                            Save services
                        </button>
                    </div>

                    <h4>Current master services</h4>
                    {masterServices.length === 0 ? (
                        <p>No services assigned</p>
                    ) : (
                        <ul>
                            {masterServices.map((item) => (
                                <li key={item.serviceId}>{item.name}</li>
                            ))}
                        </ul>
                    )}
                </section>

                <section>
                    <h3>{editingWorkingHourId === null ? "Add working hours" : "Edit working hours"}</h3>

                    <form
                        onSubmit={saveWorkingHours}
                        style={{ display: "grid", gap: 12, maxWidth: 360 }}
                    >
                        <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}>
                            {days.map((day) => (
                                <option key={day.value} value={day.value}>
                                    {day.label}
                                </option>
                            ))}
                        </select>

                        <input
                            type="time"
                            step="1"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />

                        <input
                            type="time"
                            step="1"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                        />

                        <div style={{ display: "flex", gap: 8 }}>
                            <button type="submit">
                                {editingWorkingHourId === null ? "Add working hours" : "Update working hours"}
                            </button>

                            {editingWorkingHourId !== null && (
                                <button type="button" onClick={resetWorkingHoursForm}>
                                    Cancel edit
                                </button>
                            )}
                        </div>
                    </form>

                    <h4>Current working hours</h4>
                    {workingHours.length === 0 ? (
                        <p>No working hours configured</p>
                    ) : (
                        <ul>
                            {workingHours.map((item) => (
                                <li key={item.id} style={{ marginBottom: 8 }}>
                                    {days.find((d) => d.value === item.dayOfWeek)?.label} — {item.startTime} - {item.endTime}
                                    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                                        <button type="button" onClick={() => startEditWorkingHour(item)}>
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => deleteWorkingHour(item.id)}>
                                            Delete
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </div>
    );
}