import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../shared/api/client";

type ServiceItem = {
    id: number;
    name: string;
    price: number;
    durationMinutes: number;
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

export function CreateAppointmentPage() {
    const navigate = useNavigate();

    const [services, setServices] = useState<ServiceItem[]>([]);
    const [masters, setMasters] = useState<AvailableMaster[]>([]);

    const [serviceId, setServiceId] = useState("");
    const [date, setDate] = useState("");
    const [masterId, setMasterId] = useState("");
    const [comment, setComment] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loadingMasters, setLoadingMasters] = useState(false);

    useEffect(() => {
        api.get<ServiceItem[]>("/services")
            .then((res) => setServices(res.data))
            .catch((error) =>
                setError(getErrorMessage(error, "Failed to load services"))
            );
    }, []);

    async function loadMasters() {
        setError("");
        setMasters([]);
        setMasterId("");

        if (!serviceId || !date) {
            return;
        }

        setLoadingMasters(true);

        try {
            const res = await api.get<AvailableMaster[]>("/appointments/available-masters", {
                params: {
                    serviceId: Number(serviceId),
                    date,
                },
            });

            setMasters(res.data);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to load available masters"));
        } finally {
            setLoadingMasters(false);
        }
    }

    useEffect(() => {
        loadMasters();
    }, [serviceId, date]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!serviceId) {
            setError("Select a service");
            return;
        }

        if (!date) {
            setError("Select date and time");
            return;
        }

        if (!masterId) {
            setError("Select a master");
            return;
        }

        try {
            await api.post("/appointments", {
                serviceId: Number(serviceId),
                masterId,
                date,
                comment,
            });

            setSuccess("Appointment created successfully");
            setTimeout(() => navigate("/appointments/my"), 700);
        } catch (error) {
            setError(getErrorMessage(error, "Failed to create appointment"));
        }
    }

    return (
        <div>
            <h2>Book service</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 480 }}>
                <select value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                    <option value="">Select service</option>
                    {services.map((item) => (
                        <option key={item.id} value={item.id}>
                            {item.name} — {item.price} AZN — {item.durationMinutes} min
                        </option>
                    ))}
                </select>

                <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                />

                <select value={masterId} onChange={(e) => setMasterId(e.target.value)}>
                    <option value="">Select master</option>
                    {masters.map((item) => (
                        <option key={item.masterId} value={item.masterId}>
                            {item.fullName}
                        </option>
                    ))}
                </select>

                <textarea
                    placeholder="Comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                />

                <button type="submit">Create appointment</button>
            </form>

            {loadingMasters && <p>Loading available masters...</p>}
            {!loadingMasters && masters.length === 0 && serviceId && date && (
                <p>No available masters for this time slot.</p>
            )}

            {error && <p>{error}</p>}
            {success && <p>{success}</p>}
        </div>
    );
}